<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TatumService
{
    protected $baseUrl;
    protected $headers;

    public function __construct()
    {
        $this->baseUrl = config('services.tatum.base_url');
        $this->headers = [
            'x-api-key' => config('services.tatum.api_key'),
            'Content-Type' => 'application/json',
        ];
    }

    public function generateWallet($chain)
    {
        return Http::withHeaders($this->headers)->get("{$this->baseUrl}/{$chain}/wallet")->json();
    }

    public function createAddress($chain, $xpub, $index = 0)
    {
        return Http::withHeaders($this->headers)->get("{$this->baseUrl}/{$chain}/address/{$xpub}/{$index}")->json();
    }

    public function sendCrypto($payload)
    {
        return Http::withHeaders($this->headers)->post("{$this->baseUrl}/offchain/transaction", $payload)->json();
    }

    public function getPrices($symbol)
    {
        return Http::withHeaders($this->headers)->get("{$this->baseUrl}/market/ticker/{$symbol}")->json();
    }
}
