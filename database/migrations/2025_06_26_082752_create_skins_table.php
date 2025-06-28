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
        Schema::create('skins', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('skin_code')->unique()->nullable(); // unique code from JSON
            $table->text('description')->nullable();

            // Foreign key fields
            $table->string('weapon_id');    // string (e.g., leather_handwraps)
            $table->string('category_id');  // string (e.g., sfui_invpanel_filter_gloves)
            $table->string('pattern_id');   // string (e.g., handwrap_camo_grey)
            $table->string('rarity_id');    // string (e.g., rarity_ancient)
            $table->string('team_id');      // string (e.g., both, terrorists)

            $table->float('min_float')->nullable();
            $table->float('max_float')->nullable();

            $table->boolean('stattrak')->default(false);
            $table->boolean('souvenir')->default(false);
            $table->string('paint_index')->nullable();

            $table->boolean('legacy_model')->default(false);
            $table->text('image')->nullable();

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('weapon_id')->references('id')->on('weapons')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('pattern_id')->references('id')->on('patterns')->onDelete('cascade');
            $table->foreign('rarity_id')->references('id')->on('rarities')->onDelete('cascade');
            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skins');
    }
};
