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
         Schema::create('crates', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->text('image')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->text('description')->nullable();
            $table->string('type')->nullable();
            $table->date('first_sale_date')->nullable();
            $table->string('market_hash_name')->nullable();
            $table->boolean('rental')->default(false);
            $table->string('model_player')->nullable();
            $table->string('loot_name')->nullable();
            $table->text('loot_footer')->nullable();
            $table->text('loot_image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crates');
    }
};
