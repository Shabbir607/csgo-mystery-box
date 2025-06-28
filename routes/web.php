<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SteamLoginController;
use Illuminate\Support\Facades\Http;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/steam/callback', [SteamLoginController::class, 'handleSteamCallback'])->name('steam.callback');

