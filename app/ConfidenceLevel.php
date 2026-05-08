<?php

namespace App;

enum ConfidenceLevel: string
{
    case Apprentice = 'aprendiz';
    case SelfSufficient = 'autosuficiente';
    case Master = 'maestro';
}
