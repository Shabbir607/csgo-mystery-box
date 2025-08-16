<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TatumService;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TatumWalletController extends Controller
{
    protected $tatum;

    public function __construct(TatumService $tatum)
    {
        $this->tatum = $tatum;
    }

    /**
     * Generate a new wallet and deposit address
     */
    public function generateAddress(Request $request)
    {
        $request->validate([
            'chain' => 'required|string', // e.g., BTC, ETH, USDT, LTC
        ]);

        $chain = strtoupper($request->chain);

        // Step 1: Generate Wallet (xpub, mnemonic)
        $walletData = $this->tatum->generateWallet($chain);

        if (isset($walletData['error'])) {
            return response()->json(['status' => false, 'message' => $walletData['error']], 500);
        }

        // Step 2: Generate Deposit Address
        $addressData = $this->tatum->createAddress($chain, $walletData['xpub']);

        // Save in DB
        $wallet = Wallet::create([
            'user_id' => Auth::id(),
            'chain' => $chain,
            'xpub' => $walletData['xpub'],
            'mnemonic' => $walletData['mnemonic'],
            'address' => $addressData['address'],
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Wallet generated successfully',
            'wallet' => $wallet
        ]);
    }

    /**
     * Withdraw crypto from user's wallet
     */
    public function withdraw(Request $request)
    {
        $request->validate([
            'chain' => 'required|string',
            'amount' => 'required|numeric|min:0.00000001',
            'address' => 'required|string',
            'privateKey' => 'required|string'
        ]);

        $payload = [
            'senderAccountId' => config('services.tatum.sender_account_id'),
            'address' => $request->address,
            'amount' => $request->amount,
            'fee' => '0.0001', // adjust for chain
            'privateKey' => $request->privateKey
        ];

        $withdrawData = $this->tatum->sendCrypto($payload);

        if (isset($withdrawData['error'])) {
            return response()->json(['status' => false, 'message' => $withdrawData['error']], 500);
        }

        // Save transaction
        Transaction::create([
            'user_id' => Auth::id(),
            'chain' => strtoupper($request->chain),
            'type' => 'withdraw',
            'amount' => $request->amount,
            'address' => $request->address,
            'tx_id' => $withdrawData['txId'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Withdrawal initiated',
            'data' => $withdrawData
        ]);
    }

    /**
     * Webhook endpoint for deposit confirmations
     */
    public function webhook(Request $request)
    {
        Log::info('Tatum Webhook Received', $request->all());

        if ($request->isMethod('post')) {
            $data = $request->all();

            // Example: match deposit address to wallet
            $wallet = Wallet::where('address', $data['address'] ?? null)->first();
            if ($wallet) {
                Transaction::create([
                    'user_id' => $wallet->user_id,
                    'chain' => strtoupper($data['currency']),
                    'type' => 'deposit',
                    'amount' => $data['amount'],
                    'address' => $data['address'],
                    'tx_id' => $data['txId'] ?? null,
                    'status' => 'confirmed',
                ]);
            }
        }

        return response()->json(['status' => true]);
    }

    /**
     * Get transaction history for the logged-in user
     */
    public function history()
    {
        $transactions = Transaction::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'transactions' => $transactions
        ]);
    }

    /**
     * Get live crypto prices
     */
    public function getPrices(Request $request)
    {
        $request->validate([
            'symbol' => 'required|string' // e.g., BTC, ETH
        ]);

        $prices = $this->tatum->getPrices(strtoupper($request->symbol));

        return response()->json([
            'status' => true,
            'prices' => $prices
        ]);
    }
}
