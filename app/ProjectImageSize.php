<?php

namespace App;

enum ProjectImageSize: string
{
    case Thumbnail = 'thumbnail';
    case Medium = 'medium';
    case Large = 'large';
    case Original = 'original';

    /**
     * @return int|null Width in pixels, null for original size.
     */
    public function width(): ?int
    {
        return match ($this) {
            self::Thumbnail => 300,
            self::Medium => 800,
            self::Large => 1600,
            self::Original => null,
        };
    }

    public function quality(): int
    {
        return match ($this) {
            self::Large, self::Original => 100,
            default => 80,
        };
    }
}
