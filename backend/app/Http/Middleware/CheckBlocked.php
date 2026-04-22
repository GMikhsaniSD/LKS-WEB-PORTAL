<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class CheckBlocked
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Hanya cek User (bukan Administrator)
        if ($user && $user instanceof User && $user->deleted_at !== null) {
            return response()->json([
                'status'  => 'blocked',
                'message' => 'User blocked',
                'reason'  => $user->delete_reason,
            ], 403);
        }

        return $next($request);
    }
}
