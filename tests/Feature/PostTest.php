<?php

use App\Models\Post;
use App\Models\User;

test('welcome page renders with posts prop', function () {
    Post::factory(3)->create();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('posts', 3)
            ->has('posts.0', fn ($post) => $post
                ->hasAll(['id', 'user', 'content', 'date', 'dateTime', 'likes', 'comments', 'reposts', 'commentsList'])
            )
        );
});

test('guests cannot create a post', function () {
    $this->post(route('posts.store'), ['body' => 'Hello world'])
        ->assertRedirect(route('login'));
});

test('authenticated users can create a post', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('posts.store'), ['body' => 'Hello world'])
        ->assertRedirect();

    expect(Post::query()->where('user_id', $user->id)->where('body', 'Hello world')->exists())->toBeTrue();
});

test('post body is required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('posts.store'), ['body' => ''])
        ->assertInvalid(['body']);
});

test('post body cannot exceed 1000 characters', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('posts.store'), ['body' => str_repeat('a', 1001)])
        ->assertInvalid(['body']);
});

test('authenticated users can comment on a post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    $this->actingAs($user)
        ->post(route('comments.store', $post), ['body' => 'Great post!'])
        ->assertRedirect();

    expect($post->comments()->where('user_id', $user->id)->where('body', 'Great post!')->exists())->toBeTrue();
});

test('guests cannot comment on a post', function () {
    $post = Post::factory()->create();

    $this->post(route('comments.store', $post), ['body' => 'Great post!'])
        ->assertRedirect(route('login'));
});

test('comment body is required', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    $this->actingAs($user)
        ->post(route('comments.store', $post), ['body' => ''])
        ->assertInvalid(['body']);
});

test('posts include commentsList in the feed', function () {
    $post = Post::factory()->create();
    $post->comments()->create(['user_id' => $post->user_id, 'body' => 'A comment']);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.0.commentsList', 1)
            ->has('posts.0.commentsList.0', fn ($c) => $c
                ->hasAll(['id', 'user', 'body', 'date', 'dateTime'])
            )
        );
});
