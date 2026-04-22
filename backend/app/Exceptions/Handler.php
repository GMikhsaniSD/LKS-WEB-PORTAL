<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Custom unauthenticated response
        $this->renderable(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                $token = $request->bearerToken();
                return response()->json([
                    'status'  => 'unauthenticated',
                    'message' => $token ? 'Invalid token' : 'Missing token',
                ], 401);
            }
        });

        // Global catch-all untuk no 500
        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*') && !($e instanceof \Illuminate\Auth\AuthenticationException)) {
                // Biarkan 404 dan validation tetap lewat
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                    return response()->json(['status' => 'not-found', 'message' => 'Not found'], 404);
                }
                // Tangkap semua error lainnya
                if (!$e instanceof \Illuminate\Http\Exceptions\HttpResponseException) {
                    \Log::error($e);
                    return response()->json(['status' => 'error', 'message' => 'Something went wrong'], 500);
                }
            }
        });
    }
}
