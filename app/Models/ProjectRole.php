<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectRole extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectRoleFactory> */
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'slots',
        'hours_estimated',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function volunteers(): HasMany
    {
        return $this->hasMany(ProjectVolunteer::class);
    }

    public function activeVolunteers(): HasMany
    {
        return $this->hasMany(ProjectVolunteer::class)->where('status', 'active');
    }

    public function pendingVolunteers(): HasMany
    {
        return $this->hasMany(ProjectVolunteer::class)->where('status', 'pending');
    }

    public function filledSlots(): int
    {
        return $this->activeVolunteers()->count();
    }

    public function isFull(): bool
    {
        return $this->filledSlots() >= $this->slots;
    }
}
