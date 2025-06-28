<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CsgoAgent extends Model
{
        protected $fillable = [
        'agent_id', 'name', 'description',
        'rarity_id', 'rarity_name', 'rarity_color',
        'collection_id', 'collection_name', 'collection_image',
        'team_id', 'team_name',
        'market_hash_name', 'image_url', 'model_player'
    ];
}
