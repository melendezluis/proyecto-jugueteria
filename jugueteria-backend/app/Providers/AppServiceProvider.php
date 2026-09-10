<?php

namespace App\Providers;

use App\Models\Order;
use App\Observers\OrderObserver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // El enlace del correo de restablecimiento apunta al frontend, no al backend
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            return config('app.frontend_url').'/restablecer-password?token='.$token
                .'&email='.urlencode($notifiable->getEmailForPasswordReset());
        });

        Order::observe(OrderObserver::class);
    }
}
