<?php

use App\Models\Post;
use App\Models\Reaction;
use App\Models\User;
use App\ReactionType;

test('welcome page renders with posts prop', function () {
    Post::factory(3)->create();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('posts', 3)
            ->has('posts.0', fn ($post) => $post
                ->hasAll(['id', 'user', 'content', 'date', 'dateTime', 'likes', 'isLiked', 'comments', 'coins', 'commentsList'])
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

test('authenticated users can potenciar a post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['coins' => 0]);

    $this->actingAs($user)
        ->post(route('posts.potenciar', $post))
        ->assertRedirect();

    expect($post->fresh()->coins)->toBe(10);
});

test('potenciar increments coins by 10 each time', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['coins' => 50]);

    $this->actingAs($user)
        ->post(route('posts.potenciar', $post))
        ->assertRedirect();

    expect($post->fresh()->coins)->toBe(60);
});

test('guests cannot potenciar a post', function () {
    $post = Post::factory()->create();

    $this->post(route('posts.potenciar', $post))
        ->assertRedirect(route('login'));
});

test('authenticated users can like a post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    $this->actingAs($user)
        ->post(route('posts.like', $post))
        ->assertRedirect();

    expect($post->reactions()->where('user_id', $user->id)->where('type', ReactionType::Like)->exists())->toBeTrue();
});

test('liking a post twice removes the like', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    $this->actingAs($user)->post(route('posts.like', $post));
    $this->actingAs($user)->post(route('posts.like', $post));

    expect($post->reactions()->where('user_id', $user->id)->where('type', ReactionType::Like)->exists())->toBeFalse();
});

test('guests cannot like a post', function () {
    $post = Post::factory()->create();

    $this->post(route('posts.like', $post))
        ->assertRedirect(route('login'));
});

test('feed includes like count and isLiked status', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();
    Reaction::factory()->create(['post_id' => $post->id, 'type' => ReactionType::Like]);
    Reaction::factory()->create(['post_id' => $post->id, 'user_id' => $user->id, 'type' => ReactionType::Like]);

    $this->actingAs($user)
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('posts.0.likes', 2)
            ->where('posts.0.isLiked', true)
        );
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
