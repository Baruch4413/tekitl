<?php

namespace App;

enum CoverPhotoSize: string
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
            self::Thumbnail => 400,
            self::Medium => 900,
            self::Large => 1600,
            self::Original => null,
        };
    }
}
