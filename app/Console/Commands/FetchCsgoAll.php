<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use App\Models\{
    Skin, Crate, Wear, Rarity, Category, Weapon, Pattern, CsgoAgent, Team
};

class FetchCsgoAll extends Command
{
    protected $signature = 'import:csgo-all';
    protected $description = 'Import CSGO data from all.json';

    public function handle()
    {
        $url = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/all.json';
        $localDirectory = storage_path('app/csgo');
        $localFile = $localDirectory . '/csgo_all.json';

        $this->info("⬇️ Preparing to download JSON...");

        try {
            if (!is_dir($localDirectory)) {
                mkdir($localDirectory, 0755, true);
                $this->info("📁 Directory created: $localDirectory");
            }

            if (!file_exists($localFile) || filesize($localFile) < 10000) {
                $this->info("⏳ Downloading JSON using cURL...");
                shell_exec("curl -L --max-time 300 -o \"$localFile\" \"$url\"");
            } else {
                $this->info("✅ File already exists: using cached data.");
            }

            if (!file_exists($localFile) || filesize($localFile) < 10000) {
                $this->error("❌ File was not downloaded properly or is too small.");
                return;
            }

            $data = json_decode(file_get_contents($localFile), true);
            if (!is_array($data)) {
                $this->error("❌ Failed to decode JSON.");
                return;
            }

            $skinCount = 0;
            $agentCount = 0;

            $this->info("📦 Importing Skins...");
            $skins = array_filter($data, fn($v, $k) => str_starts_with($k, 'skin-'), ARRAY_FILTER_USE_BOTH);
            foreach ($skins as $item) {
                try {
                    $weapon = Weapon::updateOrCreate(
                        ['id' => $item['weapon']['id']],
                        ['name' => $item['weapon']['name']]
                    );

                    $category = Category::updateOrCreate(
                        ['id' => $item['category']['id']],
                        ['name' => $item['category']['name']]
                    );

                    $pattern = Pattern::updateOrCreate(
                        ['id' => $item['pattern']['id']],
                        ['name' => $item['pattern']['name']]
                    );

                    $rarity = Rarity::updateOrCreate(
                        ['id' => $item['rarity']['id']],
                        [
                            'name' => $item['rarity']['name'],
                            'color' => $item['rarity']['color']
                        ]
                    );

                    $team = Team::updateOrCreate(
                        ['id' => $item['team']['id']],
                        ['name' => $item['team']['name']]
                    );

                    if (!Skin::where('skin_code', $item['skin_id'])->exists()) {
                        $skin = Skin::create([
                            'name' => $item['name'] ?? '',
                            'skin_code' => $item['skin_id'] ?? null,
                            'description' => $item['description'] ?? '',
                            'weapon_id' => $weapon->id,
                            'category_id' => $category->id,
                            'pattern_id' => $pattern->id,
                            'min_float' => $item['min_float'] ?? null,
                            'max_float' => $item['max_float'] ?? null,
                            'rarity_id' => $rarity->id,
                            'stattrak' => filter_var($item['stattrak'] ?? false, FILTER_VALIDATE_BOOLEAN),
                            'souvenir' => filter_var($item['souvenir'] ?? false, FILTER_VALIDATE_BOOLEAN),
                            'paint_index' => $item['paint_index'] ?? null,
                            'team_id' => $team->id,
                            'legacy_model' => filter_var($item['legacy_model'] ?? false, FILTER_VALIDATE_BOOLEAN),
                            'image' => $item['image'] ?? null,
                        ]);

                        // ✅ Sync wears
                        if (isset($item['wears'])) {
                            foreach ($item['wears'] as $wearData) {
                                $wear = Wear::updateOrCreate(
                                    ['id' => $wearData['id']],
                                    ['name' => $wearData['name']]
                                );
                                $skin->wears()->syncWithoutDetaching([$wear->id]);
                            }
                        }

                        // ✅ Sync crates
                        if (isset($item['crates'])) {
                            foreach ($item['crates'] as $crateData) {
                                $crate = Crate::updateOrCreate(
                                    ['id' => $crateData['id']],
                                    [
                                        'name' => $crateData['name'],
                                        'image' => $crateData['image'] ?? null
                                    ]
                                );
                                $skin->crates()->syncWithoutDetaching([$crate->id]);
                            }
                        }

                        $skinCount++;
                    }
                } catch (\Exception $e) {
                    $this->warn("⚠️ Skipping skin due to error: {$e->getMessage()}");
                }
            }

            $this->info("✅ Imported $skinCount skins.");

            $this->info("🧍 Importing Agents...");
            $agents = array_filter($data, fn($v, $k) => str_starts_with($k, 'agent-'), ARRAY_FILTER_USE_BOTH);
            foreach ($agents as $item) {
                try {
                    CsgoAgent::updateOrCreate(
                        ['agent_id' => $item['id']],
                        [
                            'name' => $item['name'] ?? '',
                            'description' => $item['description'] ?? '',
                            'rarity_id' => $item['rarity']['id'] ?? null,
                            'rarity_name' => $item['rarity']['name'] ?? null,
                            'rarity_color' => $item['rarity']['color'] ?? null,
                            'collection_id' => $item['collections'][0]['id'] ?? null,
                            'collection_name' => $item['collections'][0]['name'] ?? null,
                            'collection_image' => $item['collections'][0]['image'] ?? null,
                            'team_id' => $item['team']['id'] ?? null,
                            'team_name' => $item['team']['name'] ?? null,
                            'market_hash_name' => $item['market_hash_name'] ?? null,
                            'image_url' => $item['image'] ?? null,
                            'model_player' => $item['model_player'] ?? null,
                        ]
                    );
                    $agentCount++;
                } catch (\Exception $e) {
                    $this->warn("⚠️ Skipping agent due to error: {$e->getMessage()}");
                }
            }

            $this->info("✅ Imported $agentCount agents.");
        } catch (\Exception $e) {
            $this->error("❌ Unexpected error: " . $e->getMessage());
        }
    }
}
