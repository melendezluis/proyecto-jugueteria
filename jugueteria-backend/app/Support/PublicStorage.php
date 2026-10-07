<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class PublicStorage
{
    public const PREFIX = '/storage/';

    public static function store(UploadedFile $file, string $directory): string
    {
        $extension = strtolower($file->guessExtension() ?: $file->getClientOriginalExtension() ?: '');
        $extension = preg_replace('/[^a-z0-9]/', '', $extension) ?: 'bin';

        $path = $file->storeAs($directory, Str::random(40).'.'.$extension, 'public');

        return self::PREFIX.ltrim($path, '/');
    }

    public static function normalize(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $path = str_replace('\\', '/', $path);

        if (str_starts_with($path, self::PREFIX)) {
            return $path;
        }

        return self::PREFIX.ltrim($path, '/');
    }

    public static function relativePath(?string $path): ?string
    {
        if (blank($path) || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return null;
        }

        $path = str_replace('\\', '/', $path);

        if (str_starts_with($path, self::PREFIX)) {
            return substr($path, strlen(self::PREFIX));
        }

        return ltrim($path, '/');
    }
}
