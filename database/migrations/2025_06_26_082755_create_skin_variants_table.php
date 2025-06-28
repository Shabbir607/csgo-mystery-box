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
        Schema::create('skin_variants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('skin_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('wear_id');
            $table->string('rarity_id');
            $table->boolean('stattrak')->default(false);
            $table->boolean('souvenir')->default(false);
            $table->string('market_hash_name');
            $table->string('team_id');
            $table->integer('style_id')->nullable();
            $table->string('style_name')->nullable();
            $table->text('style_url')->nullable();
            $table->boolean('legacy_model')->default(false);
            $table->string('paint_index')->nullable();
            $table->text('image')->nullable();
            $table->timestamps();
        
            $table->foreign('skin_id')->references('id')->on('skins');
            $table->foreign('wear_id')->references('id')->on('wears');
            $table->foreign('rarity_id')->references('id')->on('rarities');
            $table->foreign('team_id')->references('id')->on('teams');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skin_variants');
    }
};
