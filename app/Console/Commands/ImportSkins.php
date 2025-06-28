<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\{Skin, Weapon, Category, Pattern, Rarity, Team};

class ImportSkins extends Command
{
    protected $signature = 'import:skins';
    protected $description = 'Import CSGO Skins from skins.json';

    public function handle()
    {
        $url = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json';
        $localDirectory = storage_path('app/csgo');
        $localFile = $localDirectory . '/skins.json';

        $this->info("⬇️ Downloading skins.json...");

        if (!is_dir($localDirectory)) {
            mkdir($localDirectory, 0755, true);
        }

        shell_exec("curl -L --max-time 300 -o \"$localFile\" \"$url\"");

        if (!file_exists($localFile) || filesize($localFile) < 1000) {
            $this->error("❌ Failed to download or empty file.");
            return;
        }

        $json = file_get_contents($localFile);
        $skins = json_decode($json, true);

        if (!is_array($skins)) {
            $this->error("❌ Invalid JSON format.");
            return;
        }

        $imported = 0;

        foreach ($skins as $skinData) {
            try {
                // Related entries creation
                $weapon = Weapon::updateOrCreate(
                    ['id' => $skinData['weapon']['id']],
                    ['name' => $skinData['weapon']['name']]
                );

                $category = Category::updateOrCreate(
                    ['id' => $skinData['category']['id']],
                    ['name' => $skinData['category']['name']]
                );

                $pattern = Pattern::updateOrCreate(
                    ['id' => $skinData['pattern']['id']],
                    ['name' => $skinData['pattern']['name']]
                );

                $rarity = Rarity::updateOrCreate(
                    ['id' => $skinData['rarity']['id']],
                    [
                        'name' => $skinData['rarity']['name'],
                        'color' => $skinData['rarity']['color'] ?? null
                    ]
                );

                $team = Team::updateOrCreate(
                    ['id' => $skinData['team']['id']],
                    ['name' => $skinData['team']['name']]
                );

                // Check and insert Skin
                if (!Skin::where('skin_code', $skinData['id'])->exists()) {
                    Skin::create([
                        'name' => $skinData['name'] ?? '',
                        'skin_code' => $skinData['id'] ?? null,
                        'description' => $skinData['description'] ?? '',
                        'weapon_id' => $weapon->id,
                        'category_id' => $category->id,
                        'pattern_id' => $pattern->id,
                        'min_float' => $skinData['min_float'] ?? null,
                        'max_float' => $skinData['max_float'] ?? null,
                        'rarity_id' => $rarity->id,
                        'stattrak' => filter_var($skinData['stattrak'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        'souvenir' => filter_var($skinData['souvenir'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        'paint_index' => $skinData['paint_index'] ?? null,
                        'team_id' => $team->id,
                        'legacy_model' => filter_var($skinData['legacy_model'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        'image' => $skinData['image'] ?? null,
                    ]);
                    $imported++;
                }
            } catch (\Exception $e) {
                $this->warn("⚠️ Skipping skin [{$skinData['id']}] due to error: " . $e->getMessage());
            }
        }

        $this->info("✅ Imported $imported skins successfully.");
    }
}
