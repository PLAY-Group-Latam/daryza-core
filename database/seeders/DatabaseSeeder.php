<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Database\Seeders\Content\HomeContentSeeder;
use Database\Seeders\Content\FooterContentSeeder;
use Database\Seeders\Content\LegalsContentSeeder;
use Database\Seeders\Content\ContactContentSeeder;
use Database\Seeders\Content\AboutUsContentSeeder;
use Database\Seeders\Content\BlogContentSeeder;
use Database\Seeders\Content\SystemAllContentSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            UbigeoSeeder::class,
            DeliveryLimaOnlySeeder::class,
            CategoriesProductsSeeder::class,
            // CommercialCatalogCouponSeeder::class,
            PageSeeder::class,
            HomeContentSeeder::class,
            FooterContentSeeder::class,
            LegalsContentSeeder::class,
            ContactContentSeeder::class,
            AboutUsContentSeeder::class,
            BlogContentSeeder::class,
            BlogSeeder::class,
            LandingSeeder::class,
            LandingLeadSeeder::class,
            SystemAllContentSeeder::class,
            JobsPortalSeeder::class,
            SeoPageSeeder::class,
            // OrderDemoSeeder::class,
            // DashboardDemoSeeder::class,
            DistributorSeeder::class

        ]);
    }
}
