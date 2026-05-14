<?php

// database/seeders/CustomerSeeder.php
namespace Database\Seeders;

use App\Models\Customers\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear el usuario fijo para tus pruebas de login
        Customer::query()->updateOrCreate(
            ['email' => 'demo@dash.test'],
            [
                'full_name' => 'Cliente Demo',
                'dni' => '70000000',
                'password' => Hash::make('password'),
                
            ]
        );

        // 2. Crear 19 usuarios aleatorios adicionales
        // Esto usará el Factory que definimos arriba
        Customer::factory()->count(19)->create();
    }
}