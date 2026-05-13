<?php
// database/factories/CustomerFactory.php
namespace Database\Factories\Customers;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'full_name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'dni' => $this->faker->unique()->numerify('########'), // 8 dígitos para Perú
            'password' => Hash::make('password'),
           
        ];
    }
}