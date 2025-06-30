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
       Schema::create('collection_crate', function (Blueprint $table) {
        $table->string('collection_id');
        $table->string('crate_id');
        $table->primary(['collection_id', 'crate_id']);
        $table->foreign('collection_id')->references('id')->on('collections')->onDelete('cascade');
        $table->foreign('crate_id')->references('id')->on('crates')->onDelete('cascade');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_crate_pivot');
    }
};
