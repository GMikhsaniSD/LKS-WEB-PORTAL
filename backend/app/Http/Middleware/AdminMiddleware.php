<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Administrator;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || !($user instanceof Administrator)) {
            return response()->json([
                'status'  => 'forbidden',
                'message' => 'You are not the administrator',
            ], 403);
        }

        return $next($request);
    }
}
