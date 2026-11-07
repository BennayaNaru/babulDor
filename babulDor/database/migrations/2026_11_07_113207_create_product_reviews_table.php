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
    Schema::create('product_reviews', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_id')->constrained();
        $table->foreignId('reviewer_id')->constrained('users');
        $table->boolean('is_clean')->default(false);
        $table->boolean('is_packaging_ok')->default(false);
        $table->boolean('is_fresh')->default(false);
        $table->boolean('is_consumable')->default(false);
        $table->enum('result', ['acc', 'tolak']);
        $table->text('notes')->nullable();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('product_reviews');
}
};
