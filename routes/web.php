<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SteamLoginController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/steam/callback', [SteamLoginController::class, 'handleSteamCallback'])->name('steam.callback');

Route::get('/run-imports', function () {
    Artisan::call('import:crates');
    Artisan::call('import:keys');
    Artisan::call('import:skins');
    Artisan::call('import:base-weapons');
    Artisan::call('import:csgo-collections');
    Artisan::call('fetch:csgo-all');

    return response()->json([
        'message' => 'All import commands executed successfully.',
        'output' => Artisan::output(),
    ]);
});
