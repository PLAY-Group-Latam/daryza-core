<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class WpPostsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->call('wp:import-posts', ['--base' => 'https://daryza.com']);
    }
}