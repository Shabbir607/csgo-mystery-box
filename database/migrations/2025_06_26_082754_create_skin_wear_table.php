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
        Schema::create('skin_wear', function (Blueprint $table) {
            $table->unsignedBigInteger('skin_id');
            $table->unsignedBigInteger('wear_id');
            $table->timestamps();

            $table->primary(['skin_id', 'wear_id']);

            $table->foreign('skin_id')->references('id')->on('skins')->onDelete('cascade');
            $table->foreign('wear_id')->references('id')->on('wears')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skin_wear');
    }
};
