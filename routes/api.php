<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\SteamLoginController;
use App\Http\Controllers\Api\CrateController;
use App\Http\Controllers\Api\BaseWeaponController;
use App\Http\Controllers\Api\UsersController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\CrateWeaponController;

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

Route::get("/steam/callback", [SteamAuthController::class, "handleSteamCallback"])->name("steam.callback");
// Admin login route
Route::post('/admin/login', [AuthController::class, 'login']);
Route::post('/verify-2fa', [AuthController::class, 'verify2fa']);
// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::get('/steam/redirect', [SteamLoginController::class, 'redirect'])->name('steam.redirect');
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Admin routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        // User management
        Route::get('/users', [UsersController::class, 'index']);
        Route::get('/users/{id}', [UsersController::class, 'show']);
        Route::post('/users/{id}', [UsersController::class, 'update']);
        Route::delete('/users/{id}', [UsersController::class, 'destroy']);

        // Special actions
        Route::get('/regular-users', [UsersController::class, 'usersWithRoleTwo']);
        Route::put("/users/{id}/unmake-admin", [UsersController::class, "unmakeAdmin"]);
        Route::patch("/users/{id}/add-funds", [UsersController::class, "addFunds"]);
        Route::put('/users/{id}/make-admin', [UsersController::class, 'makeAdmin']);

        Route::get('/steam/redirect', [SteamLoginController::class, 'redirect'])->name('steam.redirect');
        //crates routes
        Route::prefix('crates')->group(function () {
            Route::get('/', [CrateController::class, 'index']);
            Route::get('/{id}', [CrateController::class, 'show']);
            Route::post('/', [CrateController::class, 'store']);
            Route::put('/{id}', [CrateController::class, 'update']);
            Route::delete('/{id}', [CrateController::class, 'destroy']);
            Route::post('{crateId}/assign-weapons', [CrateWeaponController::class, 'assignWeapons']);
            Route::get('{crateId}/weapons', [CrateWeaponController::class, 'listWeapons']);
            Route::delete('{crateId}/weapons/{weaponId}', [CrateWeaponController::class, 'removeWeapon']);
        });
        //Collections routes
        Route::apiResource('collections', CollectionController::class);
        Route::post('collections/{id}/attach', [CollectionController::class, 'attach']);

        //Keys routes
        // Route::prefix('keys')->group(function () {
        //     Route::get('/', [KeyController::class, 'index']);
        //     Route::post('/', [KeyController::class, 'store']);
        //     Route::get('/{id}', [KeyController::class, 'show']);
        //     Route::put('/{id}', [KeyController::class, 'update']);
        //     Route::delete('/{id}', [KeyController::class, 'destroy']);
        // });
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

    // Wallet routes
    Route::prefix("wallet")->group(function () {
        Route::get("/balance", [WalletController::class, "getBalance"]);
        Route::post("/deposit", [WalletController::class, "deposit"]);
        Route::post("/withdraw", [WalletController::class, "withdraw"]);
    });




    // Crate opening routes
    Route::post("/crates/{crateId}/open", [CrateOpenController::class, "openCrate"]);
    Route::get("/crate-open-history", [CrateOpenController::class, "getCrateOpenHistory"]);




    // User Inventory routes
    Route::prefix("inventory")->group(function () {
        Route::get("/", [UserInventoryController::class, "index"]);
        Route::post("/{inventoryId}/sell", [UserInventoryController::class, "sellItem"]);
    });




    // Trade routes
    Route::prefix("trades")->group(function () {
        Route::post("/offer", [TradeController::class, "createTradeOffer"]);
        Route::post("/{tradeOfferId}/accept", [TradeController::class, "acceptTradeOffer"]);
        Route::post("/{tradeOfferId}/decline", [TradeController::class, "declineTradeOffer"]);
        Route::get("/", [TradeController::class, "getTradeOffers"]);
    });




    // Shop routes
    Route::prefix("shop")->group(function () {
        Route::get("/items", [ShopController::class, "getShopItems"]);
        Route::post("/items/{itemId}/purchase", [ShopController::class, "purchaseItem"]);
    });




    // Leaderboard routes
    Route::prefix("leaderboard")->group(function () {
        Route::get("/balance", [LeaderboardController::class, "topUsersByBalance"]);
        Route::get("/cases-opened", [LeaderboardController::class, "topUsersByCasesOpened"]);
    });




    // Admin - Base Weapons routes
    Route::prefix("admin/base-weapons")->middleware(["auth:sanctum", "admin"])->group(function () {
        Route::get("/", [BaseWeaponController::class, "index"]);
        Route::post("/", [BaseWeaponController::class, "store"]);
        Route::get("/{id}", [BaseWeaponController::class, "show"]);
        Route::put("/{id}", [BaseWeaponController::class, "update"]);
        Route::delete("/{id}", [BaseWeaponController::class, "destroy"]);
    });




    // Admin - Collections routes
    Route::prefix("admin/collections")->middleware(["auth:sanctum", "admin"])->group(function () {
        Route::get("/", [CollectionController::class, "index"]);
        Route::post("/", [CollectionController::class, "store"]);
        Route::get("/{id}", [CollectionController::class, "show"]);
        Route::put("/{id}", [CollectionController::class, "update"]);
        Route::delete("/{id}", [CollectionController::class, "destroy"]);
        Route::post("/{id}/attach", [CollectionController::class, "attach"]);
    });




    // Admin - Rarity routes
    Route::prefix("admin/rarities")->middleware(["auth:sanctum", "admin"])->group(function () {
        Route::get("/", [RarityController::class, "index"]);
        Route::post("/", [RarityController::class, "store"]);
        Route::get("/{id}", [RarityController::class, "show"]);
        Route::put("/{id}", [RarityController::class, "update"]);
        Route::delete("/{id}", [RarityController::class, "destroy"]);
    });

Route::middleware('auth:sanctum')->prefix('wallet')->group(function () {
    Route::post('/generate', [TatumWalletController::class, 'generateAddress']);
    Route::post('/withdraw', [TatumWalletController::class, 'withdraw']);
    Route::get('/history', [TatumWalletController::class, 'history']);
    Route::get('/prices', [TatumWalletController::class, 'getPrices']);
});

Route::post('/webhook/tatum', [TatumWalletController::class, 'webhook']); // No auth

