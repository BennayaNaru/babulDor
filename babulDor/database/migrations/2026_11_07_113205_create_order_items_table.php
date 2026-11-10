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
    Schema::create('order_items', function (Blueprint $table) {
        $table->id();
        $table->foreignId('order_id')->constrained()->cascadeOnDelete();
        $table->foreignId('product_id')->constrained();
        $table->unsignedInteger('quantity');
        $table->unsignedInteger('supplier_price_snapshot');
        $table->unsignedInteger('display_price_snapshot');
        $table->unsignedInteger('profit_snapshot');
    });
}

public function down(): void
{
    Schema::dropIfExists('order_items');
}
};
