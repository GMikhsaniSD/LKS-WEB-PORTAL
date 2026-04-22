<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Administrator;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        // Validasi input
        $violations = [];

        if (empty($request->username)) {
            $violations['username'] = ['message' => 'required'];
        } elseif (strlen($request->username) < 4) {
            $violations['username'] = ['message' => 'must be at least 4 characters long'];
        } elseif (strlen($request->username) > 60) {
            $violations['username'] = ['message' => 'must be at most 60 characters long'];
        }

        if (empty($request->password)) {
            $violations['password'] = ['message' => 'required'];
        } elseif (strlen($request->password) < 5) {
            $violations['password'] = ['message' => 'must be at least 5 characters long'];
        } elseif (strlen($request->password) > 10) {
            $violations['password'] = ['message' => 'must be at most 10 characters long'];
        }

        if (!empty($violations)) {
            return response()->json([
                'status'     => 'invalid',
                'message'    => 'Request body is not valid.',
                'violations' => $violations,
            ], 400);
        }

        // Cek unique username
        if (User::where('username', $request->username)->exists()) {
            return response()->json([
                'status'  => 'invalid',
                'message' => 'Username already exists',
            ], 400);
        }

        $user  = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
        ]);
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token'  => $token,
        ], 201);
    }

    public function signin(Request $request)
    {
        $username = $request->username;
        $password = $request->password;

        // Cek user dulu, termasuk yg soft-deleted
        $user = User::withTrashed()->where('username', $username)->first();

        if ($user && Hash::check($password, $user->password)) {
            if ($user->trashed()) {
                return response()->json([
                    'status'  => 'blocked',
                    'message' => 'Account blocked',
                    'reason'  => $user->delete_reason ?? 'No reason provided',
                ], 403);
            }
            $user->update(['last_login_at' => now()]);
            $token = $user->createToken('auth')->plainTextToken;
            return response()->json(['status' => 'success', 'token' => $token, 'role' => $user->role]);
        }

        // Kalau bukan user, cek admin
        $admin = Administrator::where('username', $username)->first();

        if ($admin && Hash::check($password, $admin->password)) {
            $admin->update(['last_login_at' => now()]);
            $token = $admin->createToken('auth')->plainTextToken;
            return response()->json(['status' => 'success', 'token' => $token, 'role' => 'admin']);
        }

        return response()->json([
            'status'  => 'invalid',
            'message' => 'Wrong username or password',
        ], 401);
    }

    public function signout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['status' => 'success']);
    }
}
