<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Crate extends Model
{
        use HasFactory;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'name',  'price', 'image', 'description', 'type', 'first_sale_date', 'market_hash_name', 'rental', 'model_player', 'loot_name', 'loot_footer', 'loot_image'];

    public function skins() {
        return $this->belongsToMany(Skin::class);
    }
    public function keys()
{
    return $this->belongsToMany(Key::class);
}
    public function items()
    {
        return $this->belongsToMany(BaseWeapon::class, 'crate_weapon', 'crate_id', 'base_weapon_id');
    }
}
