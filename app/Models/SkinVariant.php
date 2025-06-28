<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SkinVariant extends Model
{
        use HasFactory;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'skin_id', 'name', 'description', 'wear_id', 'rarity_id', 'stattrak', 'souvenir', 'market_hash_name', 'team_id', 'style_id', 'style_name', 'style_url', 'legacy_model', 'paint_index', 'image'];

    public function skin() { return $this->belongsTo(Skin::class); }
    public function rarity() { return $this->belongsTo(Rarity::class); }
    public function team() { return $this->belongsTo(Team::class); }
    public function wear() { return $this->belongsTo(Wear::class); }
}
