<?php

namespace App;

enum ReactionType: string
{
    case Excited = 'excited';
    case Loved = 'loved';
    case Happy = 'happy';
    case Sad = 'sad';
    case Thumbsy = 'thumbsy';
}
