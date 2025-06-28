<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Crate;
use Illuminate\Support\Facades\Http;

class ImportCrates extends Command
{
    protected $signature = 'import:crates';
    protected $description = 'Import CSGO crates from crates.json';

    public function handle()
    {
        $url = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json';
        $localDirectory = storage_path('app/csgo');
        $localFile = $localDirectory . '/crates.json';

        $this->info("⬇️ Downloading crates.json...");

        if (!is_dir($localDirectory)) {
            mkdir($localDirectory, 0755, true);
            $this->info("📁 Created directory: $localDirectory");
        }

        // Download the file using curl (or you can use Http::get)
        shell_exec("curl -L --max-time 300 -o \"$localFile\" \"$url\"");

        if (!file_exists($localFile) || filesize($localFile) < 1000) {
            $this->error("❌ Failed to download or empty file.");
            return;
        }

        $json = file_get_contents($localFile);
        $crates = json_decode($json, true);

        if (!is_array($crates)) {
            $this->error("❌ Invalid JSON structure.");
            return;
        }

        $count = 0;
        foreach ($crates as $crateData) {
            try {
                Crate::updateOrCreate(
                    ['id' => $crateData['id']],
                    [
                        'name' => $crateData['name'] ?? '',
                        'description' => $crateData['description'] ?? null,
                        'type' => $crateData['type'] ?? null,
                        'first_sale_date' => isset($crateData['first_sale_date']) ? date('Y-m-d', strtotime($crateData['first_sale_date'])) : null,
                        'market_hash_name' => $crateData['market_hash_name'] ?? null,
                        'rental' => filter_var($crateData['rental'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        'image' => $crateData['image'] ?? null,
                        'model_player' => $crateData['model_player'] ?? null,
                        'loot_list' => isset($crateData['loot_list']) ? json_encode($crateData['loot_list']) : null,
                    ]
                );
                $count++;
            } catch (\Exception $e) {
                $this->warn("⚠️ Skipping crate [{$crateData['id']}] due to error: {$e->getMessage()}");
            }
        }

        $this->info("✅ Imported $count crates successfully.");
    }
}
