<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Skin extends Model
{
        use HasFactory;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id','skin_code', 'name', 'description', 'weapon_id', 'category_id', 'pattern_id', 'min_float', 'max_float', 'rarity_id', 'stattrak', 'souvenir', 'paint_index', 'team_id', 'legacy_model', 'image'];

    public function weapon() { return $this->belongsTo(Weapon::class); }
    public function category() { return $this->belongsTo(Category::class); }
    public function pattern() { return $this->belongsTo(Pattern::class); }
    public function rarity() { return $this->belongsTo(Rarity::class); }
    public function team() { return $this->belongsTo(Team::class); }

    public function variants() { return $this->hasMany(SkinVariant::class); }
    public function wears() { return $this->belongsToMany(Wear::class); }
    public function crates() { return $this->belongsToMany(Crate::class); }
    public function collections() { return $this->belongsToMany(Collection::class); }

    
}
