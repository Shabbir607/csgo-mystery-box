<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\ProvablyFairService;

class UserGameController extends Controller
{
    protected $fairService;

    public function __construct(ProvablyFairService $fairService)
    {
        $this->fairService = $fairService;
    }

    public function initialize(Request $request)
    {
        $clientSeed = $request->input('client_seed');
        $game = $this->fairService->initializeGame($clientSeed);

        return response()->json([
            'message' => 'Game initialized',
            'data' => $game
        ]);
    }

    public function play(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|string',
            'game_type' => 'required|in:case,coinflip,dice',
            'params' => 'required|array'
        ]);

        try {
            $result = $this->fairService->playGame(
                $validated['game_id'],
                $validated['game_type'],
                $validated['params']
            );

            return response()->json([
                'message' => 'Game played',
                'result' => $result
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Game failed',
                'details' => $e->getMessage()
            ], 400);
        }
    }

    public function verify(Request $request)
    {
        $request->validate([
            'game_id' => 'required|string',
            'server_seed' => 'nullable|string'
        ]);

        $result = $this->fairService->verifyGame(
            $request->input('game_id'),
            $request->input('server_seed')
        );

        return response()->json([
            'verified' => $result['isValid'],
            'details' => $result['details'],
            'result' => $result['gameResult'] ?? null
        ]);
    }
}
