<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Key;
use App\Models\Crate;

class ImportKeys extends Command
{
    protected $signature = 'import:keys';
    protected $description = 'Import CS:GO keys and link crates from external JSON';

    public function handle()
    {
        $url = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/keys.json';
        $response = Http::get($url);

        if ($response->failed()) {
            $this->error('Failed to fetch data.');
            return 1;
        }

        $keys = $response->json();

        foreach ($keys as $data) {
            $key = Key::updateOrCreate(
                ['id' => $data['id']],
                [
                    'name' => $data['name'],
                    'description' => $data['description'] ?? null,
                    'market_hash_name' => $data['market_hash_name'] ?? null,
                    'marketable' => $data['marketable'] ?? false,
                    'image' => $data['image'] ?? null,
                ]
            );

            // Sync related crates
            if (!empty($data['crates'])) {
                $crateIds = [];

                foreach ($data['crates'] as $crateData) {
                    $crate = Crate::updateOrCreate(
                        ['id' => $crateData['id']],
                        [
                            'name' => $crateData['name'],
                            'image' => $crateData['image']
                        ]
                    );
                    $crateIds[] = $crate->id;
                }

                $key->crates()->sync($crateIds);
            }

            $this->info("Imported key: {$key->name}");
        }

        $this->info('All keys imported successfully.');
        return 0;
    }
}

