<?php

namespace App;

enum AvatarSize: string
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
            self::Thumbnail => 150,
            self::Medium => 400,
            self::Large => 800,
            self::Original => null,
        };
    }
}
