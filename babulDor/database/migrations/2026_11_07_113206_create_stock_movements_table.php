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
    Schema::create('stock_movements', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_id')->constrained();
        $table->enum('type', ['masuk', 'keluar', 'penyesuaian']);
        $table->integer('quantity');
        $table->foreignId('order_id')->nullable()->constrained();
        $table->string('note')->nullable();
        $table->foreignId('created_by')->constrained('users');
        $table->dateTime('movement_date');
        $table->timestamps();

        $table->index('movement_date');
    });
}

public function down(): void
{
    Schema::dropIfExists('stock_movements');
}
};
