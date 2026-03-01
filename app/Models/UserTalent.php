<?php

namespace App\Models;

use App\ConfidenceLevel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserTalent extends Model
{
    /** @use HasFactory<\Database\Factories\UserTalentFactory> */
    use HasFactory;

    protected $table = 'user_talents';

    protected $fillable = [
        'user_id',
        'occupation',
        'confidence_level',
        'experience_years',
    ];

    protected function casts(): array
    {
        return [
            'confidence_level' => ConfidenceLevel::class,
            'experience_years' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
