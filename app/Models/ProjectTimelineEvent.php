<?php

namespace App\Models;

use App\ProjectTimelineEventType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTimelineEvent extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectTimelineEventFactory> */
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'type',
        'data',
    ];

    protected function casts(): array
    {
        return [
            'type' => ProjectTimelineEventType::class,
            'data' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
