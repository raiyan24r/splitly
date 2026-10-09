<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class CreateAdmin extends Command
{
    /**
     * @var string
     */
    protected $signature = 'app:create-admin';

    /**
     * @var string
     */
    protected $description = 'Create (or reset the password of) the super admin who manages groups';

    public function handle(): int
    {
        $name = text('Name', default: 'Admin', required: true);
        $email = text('Email', required: true, validate: fn (string $v) => filter_var($v, FILTER_VALIDATE_EMAIL) ? null : 'Enter a valid email.');
        $password = password('Password', required: true, validate: fn (string $v) => strlen($v) >= 8 ? null : 'Use at least 8 characters.');

        User::updateOrCreate(
            ['email' => strtolower($email)],
            ['name' => $name, 'password' => $password, 'email_verified_at' => now()],
        );

        $this->components->info("Super admin {$email} is ready. Log in at ".url('/login'));

        return self::SUCCESS;
    }
}
