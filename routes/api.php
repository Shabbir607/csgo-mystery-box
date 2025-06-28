<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\SteamLoginController;
use App\Http\Controllers\Api\CrateController;
use App\Http\Controllers\Api\BaseWeaponController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with '/api' automatically
| Middleware group 'api' is applied automatically
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route::get('/steam/callback', [SteamLoginController::class, 'handleSteamCallback'])->name('steam.callback');
// Admin login route
Route::post('/admin/login', [AuthController::class, 'login']);
// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::get('/steam/redirect', [SteamLoginController::class, 'redirect'])->name('steam.redirect');
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Admin routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::apiResource('users', AdminController::class)->except(['store']);
        Route::get('/steam/redirect', [SteamLoginController::class, 'redirect'])->name('steam.redirect');
        //crates routes
        Route::prefix('crates')->group(function () {
        Route::get('/', [CrateController::class, 'index']);
        Route::get('/{id}', [CrateController::class, 'show']);
        Route::post('/', [CrateController::class, 'store']);
        Route::put('/{id}', [CrateController::class, 'update']);
        Route::delete('/{id}', [CrateController::class, 'destroy']);
        });
        //Keys routes
        Route::prefix('keys')->group(function () {
            Route::get('/', [KeyController::class, 'index']);
            Route::post('/', [KeyController::class, 'store']);
            Route::get('/{id}', [KeyController::class, 'show']);
            Route::put('/{id}', [KeyController::class, 'update']);
            Route::delete('/{id}', [KeyController::class, 'destroy']);
        });
        Route::prefix('base-weapons')->group(function () {
        Route::get('/', [BaseWeaponController::class, 'index']);
        Route::get('/{id}', [BaseWeaponController::class, 'show']);
        Route::post('/', [BaseWeaponController::class, 'store']);
        Route::put('/{id}', [BaseWeaponController::class, 'update']);
        Route::delete('/{id}', [BaseWeaponController::class, 'destroy']);
    });
    });
});

// Fallback route
Route::fallback(function () {
    return response()->json([
        'message' => 'Endpoint not found',
        'status' => 404
    ], 404);
});