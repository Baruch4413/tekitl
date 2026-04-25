<?php

use App\Models\Post;
use App\Models\Project;
use App\Models\ProjectRole;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

test('owner can create a project role', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('proyectos.roles.store', $project), [
            'title' => 'Diseñador UX',
            'description' => 'Diseño de interfaces',
            'slots' => 2,
            'hours_estimated' => 20,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('project_roles', [
        'project_id' => $project->id,
        'title' => 'Diseñador UX',
        'slots' => 2,
        'hours_estimated' => 20,
    ]);
});

test('non-owner cannot create a project role', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($other)
        ->post(route('proyectos.roles.store', $project), [
            'title' => 'Hacker',
            'slots' => 1,
            'hours_estimated' => 5,
        ])
        ->assertForbidden();
});

test('owner can update a project role', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 1]);

    $this->actingAs($user)
        ->patch(route('proyectos.roles.update', [$project, $role]), [
            'slots' => 5,
        ])
        ->assertRedirect();

    expect($role->fresh()->slots)->toBe(5);
});

test('non-owner cannot update a project role', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);

    $this->actingAs($other)
        ->patch(route('proyectos.roles.update', [$project, $role]), ['slots' => 9])
        ->assertForbidden();
});

test('owner can delete a project role', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);

    $this->actingAs($user)
        ->delete(route('proyectos.roles.destroy', [$project, $role]))
        ->assertRedirect();

    $this->assertDatabaseMissing('project_roles', ['id' => $role->id]);
});

test('non-owner cannot delete a project role', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);

    $this->actingAs($other)
        ->delete(route('proyectos.roles.destroy', [$project, $role]))
        ->assertForbidden();
});

test('project show page includes roles', function () {
    Storage::fake('s3');
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);
    ProjectRole::factory()->count(2)->create(['project_id' => $project->id]);

    $this->actingAs($user)
        ->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('proyectos/show')
            ->has('project.roles', 2)
        );
});
