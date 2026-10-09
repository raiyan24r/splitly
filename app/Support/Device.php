<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Identifies the browser a request came from: a random id the browser keeps
 * in localStorage (X-Device-Id), plus a readable "Chrome on iPhone" label.
 */
class Device
{
    public static function id(Request $request): ?string
    {
        $id = $request->header('X-Device-Id');

        return is_string($id) && preg_match('/^[A-Za-z0-9-]{8,64}$/', $id) ? $id : null;
    }

    /**
     * Short, stable tag to tell devices apart at a glance ("7F3A").
     */
    public static function tag(?string $id): ?string
    {
        return $id ? strtoupper(substr(hash('sha256', $id), 0, 4)) : null;
    }

    public static function label(?string $userAgent): ?string
    {
        if (! $userAgent) {
            return null;
        }

        $browser = match (true) {
            str_contains($userAgent, 'Edg/') => 'Edge',
            str_contains($userAgent, 'OPR/') || str_contains($userAgent, 'Opera') => 'Opera',
            str_contains($userAgent, 'SamsungBrowser') => 'Samsung Internet',
            str_contains($userAgent, 'Firefox/') || str_contains($userAgent, 'FxiOS') => 'Firefox',
            str_contains($userAgent, 'CriOS') || str_contains($userAgent, 'Chrome/') => 'Chrome',
            str_contains($userAgent, 'Safari/') => 'Safari',
            default => null,
        };

        $os = match (true) {
            str_contains($userAgent, 'iPhone') => 'iPhone',
            str_contains($userAgent, 'iPad') => 'iPad',
            str_contains($userAgent, 'Android') => 'Android',
            str_contains($userAgent, 'Windows') => 'Windows',
            str_contains($userAgent, 'CrOS') => 'ChromeOS',
            str_contains($userAgent, 'Mac OS X') || str_contains($userAgent, 'Macintosh') => 'macOS',
            str_contains($userAgent, 'Linux') => 'Linux',
            default => null,
        };

        return match (true) {
            $browser !== null && $os !== null => "{$browser} on {$os}",
            default => $browser ?? $os ?? 'Unknown device',
        };
    }
}
