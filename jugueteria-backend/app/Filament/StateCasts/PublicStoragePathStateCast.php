<?php

namespace App\Filament\StateCasts;

use Filament\Schemas\Components\StateCasts\Contracts\StateCast;

class PublicStoragePathStateCast implements StateCast
{
    private const PREFIX = '/storage/';

    public function get(mixed $state): mixed
    {
        return $state;
    }

    public function set(mixed $state): mixed
    {
        if (is_string($state)) {
            return $this->stripPrefix($state);
        }

        if (! is_array($state)) {
            return $state;
        }

        foreach ($state as $key => $value) {
            if (is_string($value)) {
                $state[$key] = $this->stripPrefix($value);
            }
        }

        return $state;
    }

    private function stripPrefix(string $path): string
    {
        return str_starts_with($path, self::PREFIX)
            ? substr($path, strlen(self::PREFIX))
            : $path;
    }
}
