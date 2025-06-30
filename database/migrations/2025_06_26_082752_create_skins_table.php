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
            $table->string('id')->primary();

            $table->string('name');
            $table->string('skin_code')->unique()->nullable();
            $table->text('description')->nullable();

            // Make foreign key fields nullable
            $table->string('weapon_id')->nullable();   
            $table->string('category_id')->nullable(); 
            $table->string('pattern_id')->nullable();  
            $table->string('rarity_id')->nullable();   
            $table->string('team_id')->nullable();     

            $table->float('min_float')->nullable();
            $table->float('max_float')->nullable();

            $table->boolean('stattrak')->default(false);
            $table->boolean('souvenir')->default(false);
            $table->string('paint_index')->nullable();

            $table->boolean('legacy_model')->default(false);
            $table->text('image')->nullable();

            $table->timestamps();

            // Foreign key constraints - only apply if columns are not null
            $table->foreign('weapon_id')->references('id')->on('weapons')->onDelete('set null');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('pattern_id')->references('id')->on('patterns')->onDelete('set null');
            $table->foreign('rarity_id')->references('id')->on('rarities')->onDelete('set null');
            $table->foreign('team_id')->references('id')->on('teams')->onDelete('set null');
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
