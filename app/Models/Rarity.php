<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Rarity extends Model
{
        use HasFactory;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'name', 'color'];

    public function skins() {
        return $this->hasMany(Skin::class);
    }
    public function skinVariants() {
        return $this->hasMany(SkinVariant::class);
    }
}
