<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectVolunteer extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectVolunteerFactory> */
    use HasFactory;

    protected $fillable = [
        'project_role_id',
        'user_id',
        'status',
        'hours_committed',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(ProjectRole::class, 'project_role_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
