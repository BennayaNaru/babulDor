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
    Schema::table('users', function (Blueprint $table) {
        $table->string('identifier')->nullable()->unique()->after('id'); // NISN/NIP
        $table->enum('user_type', ['siswa', 'guru'])->nullable()->after('name');
        $table->string('class_or_position')->nullable()->after('user_type');
        $table->enum('role', ['user', 'admin_pengurus', 'admin_pembina'])->default('user');
        $table->boolean('is_active')->default(true);
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['identifier', 'user_type', 'class_or_position', 'role', 'is_active']);
    });
}
};
