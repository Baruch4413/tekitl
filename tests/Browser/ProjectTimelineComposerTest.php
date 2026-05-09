<?php

declare(strict_types=1);

use App\Models\Post;
use App\Models\Project;
use App\Models\User;

it('clears the textarea and refreshes the timeline after posting a status update', function () {
    $owner = User::factory()->create([
        'email' => 'composer-test@example.com',
        'password' => bcrypt('password'),
    ]);
    $post = Post::factory()->for($owner)->create();
    Project::factory()->for($post)->create([
        'user_id' => $owner->id,
    ]);

    visit('/login')
        ->fill('email', 'composer-test@example.com')
        ->fill('password', 'password')
        ->press('Iniciar sesión');

    visit("/projects/{$post->id}")
        ->click('Actualización')
        ->fill('body', 'shipping the timeline composer')
        ->press('Publicar')
        ->assertSee('shipping the timeline composer')
        ->assertValue('body', '');
});
