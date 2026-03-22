<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectImage extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectImageFactory> */
    use HasFactory;

    protected $fillable = [
        'project_id',
        'path',
        'order',
        'title',
        'description',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
