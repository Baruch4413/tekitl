<?php

use App\Models\Post;
use App\Models\User;

test('user profile page renders with user info', function () {
    $user = User::factory()->create();
    Post::factory(3)->create(['user_id' => $user->id]);

    $this->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/show')
            ->has('profileUser', fn ($prop) => $prop
                ->where('id', $user->id)
                ->where('name', $user->name)
                ->where('postsCount', 3)
                ->etc()
            )
            ->has('posts.data', 3)
        );
});

test('user profile page only shows that users posts', function () {
    $user = User::factory()->create();
    Post::factory(2)->create(['user_id' => $user->id]);
    Post::factory(3)->create(); // other users' posts

    $this->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.data', 2)
        );
});

test('guests can view user profiles', function () {
    $user = User::factory()->create();

    $this->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/show')
        );
});

test('user profile shows zero posts for user with no posts', function () {
    $user = User::factory()->create();

    $this->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('profileUser.postsCount', 0)
            ->has('posts.data', 0)
        );
});
