<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profit_notes', function (Blueprint $table) {
            $table->id();
            $table->string('nama_barang');
            $table->time('jam_jual');
            $table->integer('qty');
            $table->integer('laba_per_pcs');
            $table->date('tanggal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profit_notes');
    }
};
