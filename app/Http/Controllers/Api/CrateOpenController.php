<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CrateOpenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CrateOpenController extends Controller
{
    protected $service;

    public function __construct(CrateOpenService $service)
    {
        $this->service = $service;
    }

    public function open(Request $request, $crateId)
    {
        $request->validate([
            'client_seed' => 'required|string|min:5',
        ]);

        $user = Auth::guard('sanctum')->user();

        $crateOpen = $this->service->openCrate($user, $crateId, $request->client_seed);

        return response()->json([
            'message' => 'Crate opened successfully.',
            'result' => $crateOpen
        ]);
    }
}