<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Administrator;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Administrators (sesuai dokumentasi soal)
        Administrator::create([
            'username' => 'admin1',
            'password' => Hash::make('hellouniverse1!'),
        ]);
        Administrator::create([
            'username' => 'admin2',
            'password' => Hash::make('hellouniverse2!'),
        ]);

        // Developers (sesuai dokumentasi soal)
        User::create([
            'username' => 'dev1',
            'password' => Hash::make('hellobyte1!'),
            'role'     => 'dev',
        ]);
        User::create([
            'username' => 'dev2',
            'password' => Hash::make('hellobyte2!'),
            'role'     => 'dev',
        ]);

        // Players (sesuai dokumentasi soal)
        User::create([
            'username' => 'player1',
            'password' => Hash::make('helloworld1!'),
        ]);
        User::create([
            'username' => 'player2',
            'password' => Hash::make('helloworld2!'),
        ]);
    }
}
