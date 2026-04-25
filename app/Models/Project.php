<?php

namespace App\Models;

use App\ProjectStage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use InvalidArgumentException;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_id',
        'title',
        'description',
        'goal',
        'stage',
    ];

    protected function casts(): array
    {
        return [
            'stage' => ProjectStage::class,
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('order');
    }

    public function roles(): HasMany
    {
        return $this->hasMany(ProjectRole::class);
    }

    public function timelineEvents(): HasMany
    {
        return $this->hasMany(ProjectTimelineEvent::class)->orderBy('created_at');
    }

    // -------------------------------------------------------------------------
    // State machine
    // -------------------------------------------------------------------------

    public function canTransitionTo(ProjectStage $stage): bool
    {
        return $this->stage->canTransitionTo($stage);
    }

    public function transitionTo(ProjectStage $stage): void
    {
        if (! $this->canTransitionTo($stage)) {
            throw new InvalidArgumentException(
                "Cannot transition from [{$this->stage->value}] to [{$stage->value}]."
            );
        }

        $this->update(['stage' => $stage]);
    }

    public function start(): void
    {
        $this->transitionTo(ProjectStage::InExecution);
    }

    public function complete(): void
    {
        $this->transitionTo(ProjectStage::Completed);
    }

    public function abort(): void
    {
        $this->transitionTo(ProjectStage::Aborted);
    }
}
