<?php

use App\Models\Post;
use App\Models\Project;
use App\Models\User;

test('inertia requests by guests receive loginRequired flash instead of redirect to login', function () {
    $post = Post::factory()->create();

    $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => '1'])
        ->from(route('home'))
        ->post(route('comments.store', $post), ['body' => 'test'])
        ->assertRedirect(route('home'))
        ->assertSessionHas('loginRequired', true);
});

test('non-inertia requests by guests still redirect to login', function () {
    $post = Post::factory()->create();

    $this->post(route('comments.store', $post), ['body' => 'test'])
        ->assertRedirect(route('login'));
});

test('inertia 403 responses return loginRequired flash', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);

    $this->actingAs($other)
        ->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => '1'])
        ->from(route('home'))
        ->patch(route('proyectos.update', $project), [
            'title' => 'Hacked',
            'description' => 'Hacked',
            'goal' => 1,
        ])
        ->assertRedirect(route('home'))
        ->assertSessionHas('loginRequired', true);
});

test('non-inertia 403 responses remain as 403', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);

    $this->actingAs($other)
        ->patch(route('proyectos.update', $project), [
            'title' => 'Hacked',
            'description' => 'Hacked',
            'goal' => 1,
        ])
        ->assertForbidden();
});

test('popup flag is stored in session on socialite redirect', function () {
    $this->get(route('auth.google.redirect', ['popup' => 1]));

    expect(session()->get('auth_popup'))->toBeTrue();
});

test('socialite redirect without popup flag does not set session', function () {
    $this->get(route('auth.google.redirect'));

    expect(session()->get('auth_popup'))->toBeNull();
});
