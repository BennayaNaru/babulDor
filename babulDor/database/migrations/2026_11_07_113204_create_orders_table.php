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
       Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->foreignId('buyer_id')->constrained('users');
    $table->enum('status', ['dipesan', 'siap_diambil', 'selesai', 'dibatalkan'])->default('dipesan');
    $table->unsignedInteger('total_price');
    $table->string('pickup_point');            // ← wajib ada
    $table->string('pickup_code', 10);         // ← wajib ada
    $table->timestamp('completed_at')->nullable()->index();
    $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
