<?php
namespace App\Http\Controllers;

use App\Models\Administrator;

class AdminController extends Controller
{
    public function index()
    {
        $admins = Administrator::all();
        return response()->json([
            'totalElements' => $admins->count(),
            'content' => $admins->map(fn($a) => [
                'id'           => $a->id,
                'username'     => $a->username,
                'last_login_at'=> $a->last_login_at ? $a->last_login_at->toISOString() : null,
                'created_at'   => $a->created_at ? $a->created_at->toISOString() : null,
                'updated_at'   => $a->updated_at ? $a->updated_at->toISOString() : null,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $violations = [];
        if (empty($request->username)) $violations['username'] = ['message' => 'required'];
        if (empty($request->password)) $violations['password'] = ['message' => 'required'];
        
        if (!empty($violations)) {
            return response()->json(['status' => 'invalid', 'violations' => $violations], 400);
        }

        if (Administrator::where('username', $request->username)->exists()) {
            return response()->json(['status' => 'invalid', 'message' => 'Admin username exists'], 400);
        }

        Administrator::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['status' => 'success'], 201);
    }

    public function update(Request $request, $id)
    {
        $admin = Administrator::find($id);
        if (!$admin) return response()->json(['status' => 'not-found'], 404);

        $violations = [];
        if (empty($request->username)) $violations['username'] = ['message' => 'required'];
        if (empty($request->password)) $violations['password'] = ['message' => 'required'];
        
        if (!empty($violations)) {
            return response()->json(['status' => 'invalid', 'violations' => $violations], 400);
        }

        if (Administrator::where('username', $request->username)->where('id', '!=', $id)->exists()) {
            return response()->json(['status' => 'invalid', 'message' => 'Admin username exists'], 400);
        }

        $admin->update([
            'username' => $request->username,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['status' => 'success']);
    }

    public function destroy($id)
    {
        $admin = Administrator::find($id);
        if (!$admin) return response()->json(['status' => 'not-found'], 404);

        if (Administrator::count() <= 1) {
            return response()->json(['status' => 'forbidden', 'message' => 'Cannot delete the only remaining admin'], 403);
        }

        $admin->delete();
        return response()->noContent();
    }
}
