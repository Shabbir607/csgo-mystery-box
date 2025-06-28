<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('crate_weapon', function (Blueprint $table) {
            $table->id();
            $table->string('crate_id');
            $table->string('base_weapon_id');
            $table->foreign('crate_id')->references('id')->on('crates')->onDelete('cascade');
            $table->foreign('base_weapon_id')->references('id')->on('base_weapons')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crate_weapon');
    }
};
