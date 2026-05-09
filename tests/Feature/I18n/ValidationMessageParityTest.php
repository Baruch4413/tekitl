<?php

declare(strict_types=1);

use App\Models\Post;
use App\Models\Project;
use App\Models\User;

it('returns the Spanish required message for an empty comment body', function () {
    $author = User::factory()->create();
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);

    $this->actingAs($author)
        ->from(route('proyectos.show', $post))
        ->post(route('proyectos.comments.store', $project), ['body' => ''])
        ->assertSessionHasErrors([
            'body' => 'El comentario no puede estar vacío.',
        ]);
});

it('returns the Spanish max-length message when the body is too long', function () {
    $author = User::factory()->create();
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);

    $this->actingAs($author)
        ->from(route('proyectos.show', $post))
        ->post(route('proyectos.comments.store', $project), ['body' => str_repeat('a', 1001)])
        ->assertSessionHasErrors([
            'body' => 'El comentario no puede exceder los 1000 caracteres.',
        ]);
});
