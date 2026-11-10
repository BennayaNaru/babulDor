<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Snack & Jajanan',
            'Makanan Berat',
            'Minuman Segar',
            'Kerajinan Kreatif',
        ];

        foreach ($names as $name) {
            DB::table('categories')->updateOrInsert(['name' => $name]);
        }
    }
}
