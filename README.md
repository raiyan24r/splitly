# Splitly

A light, web-only Splitwise. Dark mode, no sign-ups.

- **Admin** logs in to create groups. Each group gets a random, unguessable link plus a password.
- **Everyone else** opens the link, enters the password, and taps their name. The name is remembered in the browser's localStorage.
- Splits can be equal, exact amounts, percentages, shares, or +/− adjustments. An expense can have multiple payers.
- **Balances** can be shown pairwise or simplified into the fewest payments. Settle up is supported.
- Expenses can have comments and receipts (photo/PDF).
- Deleting an expense can be undone with a restore.
- Expenses and payments can be exported as CSV.
- **Audit log** records every change, unlock, and failed password attempt with who, IP, and device. Members see it as the group's *Activity* tab, and the admin sees all of it at `/admin/audit-logs`.

Stack: Laravel 13 · Inertia 3 · React 19 · Tailwind 4 · MySQL.

## Setup

```bash
composer install
npm install
```

Create `.env`:

```dotenv
APP_NAME=Splitly
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bill_splitting
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=10080
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
MAIL_MAILER=log

# The super admin (the only account that logs in)
ADMIN_NAME=Admin
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=change-me

VITE_APP_NAME="${APP_NAME}"
```

Then:

```bash
php artisan key:generate
mysql -u root -p -e "CREATE DATABASE bill_splitting"
php artisan migrate --seed      # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD
composer run dev                # http://localhost:8000
```

Log in at `/login` and create a group. Then share its link and password.

You can create or reset the admin at any time with `php artisan app:create-admin`.

## How it fits together

| Piece | Where |
|---|---|
| Split maths (largest-remainder rounding, so splits always add up) | `app/Services/SplitCalculator.php` |
| Net and pairwise balances | `app/Services/BalanceCalculator.php` |
| Simplify debts (greedy min-transfers) | `app/Services/DebtSimplifier.php` |
| Audit log writer | `app/Services/AuditLogger.php` |
| Group password / "remember this device" | `app/Support/GroupAccess.php`, `EnsureGroupUnlocked` middleware |
| "Who are you" (localStorage → `X-Member-Id` header) | `resources/js/lib/identity.ts`, `ResolveGroupActor` middleware |
| Group page | `resources/js/pages/groups/show.tsx`, `resources/js/components/group/*` |
| Admin | `app/Http/Controllers/Admin/*`, `resources/js/pages/admin/*` |

Money is stored as integers in the currency's minor unit (fils, cents…). Because of that, a group's currency is locked once it has expenses.

Changing a group's password signs out every device. Generating a new link kills the old one.
