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
            ->has('posts.data', 3)
            ->has('posts.data.0', fn ($post) => $post
                ->hasAll(['id', 'user', 'content', 'date', 'dateTime', 'likes', 'isLiked', 'isPoweredByCurrentUser', 'comments', 'coins'])
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
            ->where('posts.data.0.likes', 2)
            ->where('posts.data.0.isLiked', true)
        );
});

test('comments endpoint returns formatted comments', function () {
    $post = Post::factory()->create();
    $post->comments()->create(['user_id' => $post->user_id, 'body' => 'A comment']);

    $this->getJson(route('comments.index', $post))
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonStructure([['id', 'user', 'body', 'date', 'dateTime']]);
});

test('comments endpoint returns empty array for post with no comments', function () {
    $post = Post::factory()->create();

    $this->getJson(route('comments.index', $post))
        ->assertOk()
        ->assertJsonCount(0);
});
