<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ScoreController;

Route::prefix('v1')->group(function () {

    // ─── AUTH ───────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('signup',  [AuthController::class, 'signup']);
        Route::post('signin',  [AuthController::class, 'signin']);
        Route::post('signout', [AuthController::class, 'signout'])
            ->middleware(['auth:sanctum', 'check.blocked']);
    });

    // ─── ADMINS ─────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'check.blocked', 'admin'])->group(function () {
        Route::get('admins', [AdminController::class, 'index']);
        Route::post('admins', [AdminController::class, 'store']);
        Route::put('admins/{id}', [AdminController::class, 'update']);
        Route::delete('admins/{id}', [AdminController::class, 'destroy']);
    });

    // ─── USERS ──────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'check.blocked'])->group(function () {
        Route::get('users',        [UserController::class, 'index'])->middleware('admin');
        Route::post('users',       [UserController::class, 'store'])->middleware('admin');
        Route::put('users/{id}',   [UserController::class, 'update'])->middleware('admin');
        Route::delete('users/{id}',[UserController::class, 'destroy'])->middleware('admin');
        Route::post('users/{id}/unlock', [UserController::class, 'unlock'])->middleware('admin');
        Route::get('users/{username}', [UserController::class, 'show']);
    });

    // ─── GAMES ──────────────────────────────────────────────
    Route::get('games',         [GameController::class, 'index']);
    Route::get('games/{slug}',  [GameController::class, 'show']);
    Route::get('games/{slug}/scores', [ScoreController::class, 'index']);

    Route::middleware(['auth:sanctum', 'check.blocked'])->group(function () {
        Route::post('games',              [GameController::class, 'store']);
        Route::put('games/{slug}',        [GameController::class, 'update']);
        Route::delete('games/{slug}',     [GameController::class, 'destroy']);
        Route::post('games/{slug}/scores',[ScoreController::class, 'store'])->middleware('throttle:30,1'); // Limit 30 scores per min
    });

    // Upload: auth via form field token (tidak pakai middleware auth:sanctum)
    Route::post('games/{slug}/upload', [GameController::class, 'upload'])->middleware('throttle:10,1'); // Limit upload 10 per min
    Route::post('games/{slug}/thumbnail', [GameController::class, 'uploadThumbnail'])->middleware('throttle:10,1');

});

// ─── FALLBACK ─────────────────────────────────────────────
Route::fallback(function () {
    return response()->json([
        'status'  => 'not-found',
        'message' => 'Not found',
    ], 404);
});
