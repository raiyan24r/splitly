<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the super admin from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
     */
    public function run(): void
    {
        $email = config('app.admin.email');
        $password = config('app.admin.password');

        if (! is_string($email) || ! is_string($password) || $email === '' || $password === '') {
            $this->command->warn('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env (or run `php artisan app:create-admin`).');

            return;
        }

        User::updateOrCreate(
            ['email' => strtolower($email)],
            ['name' => config('app.admin.name'), 'password' => $password, 'email_verified_at' => now()],
        );

        $this->command->info("Super admin ready: {$email}");
    }
}
