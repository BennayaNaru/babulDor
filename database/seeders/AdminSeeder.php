<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'name'  => 'Afzal Daniyal Akif',
                'kelas' => 'XI RPL',
                'nisn'  => '0105721436',
                'nis'   => '19430',
            ],
            [
                'name'  => 'Salsabila Azzahra Syah Putri',
                'kelas' => 'XI AK 2',
                'nisn'  => '0085022482',
                'nis'   => '19205',
            ],
            [
                'name'  => 'Azreal Putra Felansyah',
                'kelas' => 'XI BD',
                'nisn'  => '0087913199',
                'nis'   => '19218',
            ],
            [
                'name'  => 'Faith Sarina Galiba Tobing',
                'kelas' => 'XI ULW',
                'nisn'  => '3100659028',
                'nis'   => '19404',
            ],
            [
                'name'  => 'Shaffa Awliya',
                'kelas' => 'XI BR 2',
                'nisn'  => '0092291647',
                'nis'   => '19316',
            ],


        ];

        foreach ($admins as $admin) {
            User::create($admin);
        }
    }
}
