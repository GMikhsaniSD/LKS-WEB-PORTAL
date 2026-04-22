<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;

Route::get('/', function () {
    return view('welcome');
});

// Serve custom thumbnail
Route::get('/games/{slug}/custom_thumbnail', [GameController::class, 'serveCustomThumbnail']);

// Serve static game files
Route::get('/games/{slug}/{version}/{file?}', [GameController::class, 'serveGameFile'])
    ->where('file', '.*');
