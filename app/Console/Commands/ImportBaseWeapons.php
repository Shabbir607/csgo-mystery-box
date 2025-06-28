<?php

namespace App\Console\Commands;


use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\BaseWeapon;

class ImportBaseWeapons extends Command
{
    protected $signature = 'import:base-weapons';
    protected $description = 'Import base weapons from external JSON';

    public function handle()
    {
        $url = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/base_weapons.json';
        $response = Http::get($url);

        if ($response->failed()) {
            $this->error('Failed to fetch base weapons.');
            return 1;
        }

        $weapons = $response->json();

        foreach ($weapons as $weapon) {
            BaseWeapon::updateOrCreate(
                ['id' => $weapon['id']],
                [
                    'name' => $weapon['name'],
                    'description' => $weapon['description'] ?? null,
                    'image' => $weapon['image'] ?? null,
                ]
            );

            $this->info("Imported: {$weapon['name']}");
        }

        $this->info('All base weapons imported successfully.');
        return 0;
    }
}

