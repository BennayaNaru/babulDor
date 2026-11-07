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
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->foreignId('supplier_id')->constrained('users');
        $table->foreignId('category_id')->constrained('categories');
        $table->string('name');
        $table->text('description')->nullable();
        $table->string('image')->nullable();
        $table->unsignedInteger('supplier_price');
        $table->unsignedInteger('display_price'); // supplier_price + 1000
        $table->unsignedInteger('stock')->default(0);
        $table->enum('status', ['menunggu', 'disetujui', 'ditolak', 'nonaktif'])->default('menunggu');
        $table->text('rejection_reason')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });
}

public function down(): void
{
    Schema::dropIfExists('products');
}
};
