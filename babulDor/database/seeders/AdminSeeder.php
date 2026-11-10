<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {

        // Akun demo untuk development
        User::updateOrCreate(['identifier' => '0000000001'], [
            'name' => 'Siswa Demo',
            'user_type' => 'siswa',
            'class_or_position' => 'XI RPL',
            'role' => 'user',
            'is_active' => true,
        ]);
        User::updateOrCreate(['identifier' => '0000000003'], [
            'name' => 'Pengurus Demo',
            'user_type' => 'siswa',     
            'class_or_position' => 'XI AK 1',
            'role' => 'admin_pengurus',
            'is_active' => true,
        ]); 

        // Admin pengurus
        User::updateOrCreate(
            ['identifier' => '0105721436'],
            [
                'name' => 'Afzal Daniyal Akif',
                'user_type' => 'siswa',
                'class_or_position' => 'XI RPL',
                'role' => 'admin_pengurus',
                'is_active' => true,
            ]
        );

        // Admin pembina
        User::updateOrCreate(
            ['identifier' => '0000000002'],
            [
                'name' => 'Admin Pembina',
                'user_type' => 'guru',
                'class_or_position' => 'Pembina PKK',
                'role' => 'admin_pembina',
                'is_active' => true,
            ]
        );

        // Contoh guru (untuk tes pintu login guru)
        User::updateOrCreate(
            ['identifier' => '198001012005011001'],
            [
                'name' => 'Guru Contoh',
                'user_type' => 'guru',
                'class_or_position' => 'Guru Produktif',
                'role' => 'user',
                'is_active' => true,
            ]
        );
    }
}
