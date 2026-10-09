<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\GroupController as AdminGroupController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

/*
|--------------------------------------------------------------------------
| Groups (password protected, no login)
|--------------------------------------------------------------------------
*/

Route::prefix('g/{group}')->name('groups.')->scopeBindings()->group(function () {
    Route::get('/', [GroupController::class, 'show'])->name('show');
    Route::post('unlock', [GroupController::class, 'unlock'])->name('unlock');

    Route::middleware('group.unlocked')->group(function () {
        // Logging out and picking "who am I" only need the actor for the audit log.
        Route::middleware('group.actor:read')->group(function () {
            Route::post('lock', [GroupController::class, 'lock'])->name('lock');
            Route::post('identity', [GroupController::class, 'identify'])->name('identity');
        });
        Route::get('expenses/{expense}/receipt', [ExpenseController::class, 'receipt'])->name('expenses.receipt');
        Route::get('export.csv', ExportController::class)->name('export');

        // Joining as a new person happens before an identity is picked.
        Route::post('members', [MemberController::class, 'store'])
            ->middleware('group.actor:optional')
            ->name('members.store');

        Route::middleware('group.actor')->group(function () {
            Route::patch('settings', [GroupController::class, 'updateSettings'])->name('settings.update');

            Route::patch('members/{member}', [MemberController::class, 'update'])->name('members.update');
            Route::delete('members/{member}', [MemberController::class, 'destroy'])->name('members.destroy');

            Route::post('expenses', [ExpenseController::class, 'store'])->name('expenses.store');
            Route::put('expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
            Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
            Route::post('expenses/{expense}/restore', [ExpenseController::class, 'restore'])
                ->withoutScopedBindings()
                ->name('expenses.restore');

            Route::post('expenses/{expense}/comments', [CommentController::class, 'store'])->name('comments.store');
            Route::delete('expenses/{expense}/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

            Route::post('payments', [PaymentController::class, 'store'])->name('payments.store');
            Route::put('payments/{payment}', [PaymentController::class, 'update'])->name('payments.update');
            Route::delete('payments/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy');
        });
    });
});

/*
|--------------------------------------------------------------------------
| Super admin
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', fn () => to_route('admin.groups.index'))->name('home');

    Route::get('groups', [AdminGroupController::class, 'index'])->name('groups.index');
    Route::post('groups', [AdminGroupController::class, 'store'])->name('groups.store');
    Route::get('groups/{group}', [AdminGroupController::class, 'show'])->name('groups.show');
    Route::patch('groups/{group}', [AdminGroupController::class, 'update'])->name('groups.update');
    Route::put('groups/{group}/password', [AdminGroupController::class, 'password'])->name('groups.password');
    Route::post('groups/{group}/regenerate-link', [AdminGroupController::class, 'regenerateSlug'])->name('groups.regenerate-link');
    Route::post('groups/{group}/archive', [AdminGroupController::class, 'archive'])->name('groups.archive');
    Route::delete('groups/{group}', [AdminGroupController::class, 'destroy'])->name('groups.destroy');

    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
});

require __DIR__.'/settings.php';
