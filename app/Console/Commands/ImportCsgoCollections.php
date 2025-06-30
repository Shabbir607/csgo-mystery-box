<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use Illuminate\Support\Facades\Http;
use App\Models\Collection;
use App\Models\Crate;
use App\Models\Skin;
use App\Models\Rarity;

class ImportCsgoCollections extends Command
{
    protected $signature = 'csgo:import-collections';
    protected $description = 'Import CS:GO collections from GitHub API';

    public function handle()
    {
        $url = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/collections.json';
        
        $response = Http::get($url);
        
        if (!$response->successful()) {
            $this->error('Failed to fetch data from the API');
            return;
        }
        
        $collections = $response->json();
        
        $this->info('Starting import of '.count($collections).' collections...');
        
        $progressBar = $this->output->createProgressBar(count($collections));
        $progressBar->start();
        
        foreach ($collections as $collectionData) {
            $this->importCollection($collectionData);
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->newLine();
        $this->info('Collections imported successfully!');
    }
    
    protected function importCollection(array $collectionData)
    {
        // Create or update collection
        $collection = Collection::updateOrCreate(
            ['id' => $collectionData['id']],
            [
                'name' => $collectionData['name'],
                'image' => $collectionData['image'] ?? null,
            ]
        );
        
        // Import crates
        foreach ($collectionData['crates'] ?? [] as $crateData) {
            $crate = Crate::updateOrCreate(
                ['id' => $crateData['id']],
                [
                    'name' => $crateData['name'],
                    'image' => $crateData['image'] ?? null,
                ]
            );
            
            $collection->crates()->syncWithoutDetaching([$crate->id]);
        }
        
        // Import skins
        foreach ($collectionData['contains'] ?? [] as $skinData) {
            $rarity = Rarity::updateOrCreate(
                ['id' => $skinData['rarity']['id']],
                [
                    'name' => $skinData['rarity']['name'],
                    'color' => $skinData['rarity']['color'],
                ]
            );
            
            $skin = Skin::updateOrCreate(
                ['id' => $skinData['id']],
                [
                    'name' => $skinData['name'],
                    'paint_index' => $skinData['paint_index'] ?? null,
                    'image' => $skinData['image'] ?? null,
                ]
            );
            
            $collection->skins()->syncWithoutDetaching([
                $skin->id => ['rarity_id' => $rarity->id]
            ]);
        }
    }
}
