<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CrateOpenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CrateOpenController extends Controller
{
    protected $crateOpenService;

    public function __construct(CrateOpenService $crateOpenService)
    {
        $this->crateOpenService = $crateOpenService;
    }

    public function openCrate(Request $request, $crateId)
    {
        $request->validate([
            'client_seed' => 'required|string|min:5',
        ]);

        $user = Auth::user();

        try {
            $result = $this->crateOpenService->openCrate($user, $crateId, $request->client_seed);

            return response()->json([
                'message' => 'Crate opened successfully!',
                'result' => $result,
                'new_balance' => $user->details->balance, // Assuming balance is updated within the service
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to open crate.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCrateOpenHistory(Request $request)
    {
        $user = Auth::user();

        $history = \App\Models\CrateOpen::with(['crate', 'resultWeapon'])
                            ->where('user_id', $user->id)
                            ->orderBy('created_at', 'desc')
                            ->paginate(10);

        return response()->json(['history' => $history], 200);
    }
}


