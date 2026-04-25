<?php

use App\Models\Project;
use App\Models\ProjectRole;
use App\Models\ProjectVolunteer;
use App\Models\User;

test('user can apply for a role', function () {
    $owner = User::factory()->create();
    $applicant = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 2]);

    $this->actingAs($applicant)
        ->post(route('proyectos.volunteers.store', [$project, $role]))
        ->assertRedirect();

    $this->assertDatabaseHas('project_volunteers', [
        'project_role_id' => $role->id,
        'user_id' => $applicant->id,
        'status' => 'pending',
    ]);
});

test('owner cannot apply to their own project', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);

    $this->actingAs($owner)
        ->post(route('proyectos.volunteers.store', [$project, $role]))
        ->assertForbidden();
});

test('user cannot apply twice to the same project', function () {
    $owner = User::factory()->create();
    $applicant = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 5]);

    ProjectVolunteer::factory()->create([
        'project_role_id' => $role->id,
        'user_id' => $applicant->id,
        'status' => 'pending',
    ]);

    $this->actingAs($applicant)
        ->post(route('proyectos.volunteers.store', [$project, $role]))
        ->assertForbidden();
});

test('user cannot apply to a full role', function () {
    $owner = User::factory()->create();
    $applicant = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 1]);

    ProjectVolunteer::factory()->active()->create([
        'project_role_id' => $role->id,
    ]);

    $this->actingAs($applicant)
        ->post(route('proyectos.volunteers.store', [$project, $role]))
        ->assertForbidden();
});

test('owner can accept an applicant', function () {
    $owner = User::factory()->create();
    $applicant = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);
    $volunteer = ProjectVolunteer::factory()->create([
        'project_role_id' => $role->id,
        'user_id' => $applicant->id,
        'status' => 'pending',
    ]);

    $this->actingAs($owner)
        ->patch(route('proyectos.volunteers.update', [$project, $volunteer]), ['status' => 'active'])
        ->assertRedirect();

    expect($volunteer->fresh()->status)->toBe('active');
    expect($volunteer->fresh()->joined_at)->not->toBeNull();
});

test('owner can reject an applicant', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);
    $volunteer = ProjectVolunteer::factory()->create([
        'project_role_id' => $role->id,
        'status' => 'pending',
    ]);

    $this->actingAs($owner)
        ->patch(route('proyectos.volunteers.update', [$project, $volunteer]), ['status' => 'bailed'])
        ->assertRedirect();

    expect($volunteer->fresh()->status)->toBe('bailed');
});

test('non-owner cannot review applicants', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);
    $volunteer = ProjectVolunteer::factory()->create(['project_role_id' => $role->id, 'status' => 'pending']);

    $this->actingAs($other)
        ->patch(route('proyectos.volunteers.update', [$project, $volunteer]), ['status' => 'active'])
        ->assertForbidden();
});

test('volunteer can withdraw their application', function () {
    $owner = User::factory()->create();
    $applicant = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);
    $volunteer = ProjectVolunteer::factory()->create([
        'project_role_id' => $role->id,
        'user_id' => $applicant->id,
        'status' => 'pending',
    ]);

    $this->actingAs($applicant)
        ->delete(route('proyectos.volunteers.destroy', [$project, $volunteer]))
        ->assertRedirect();

    $this->assertDatabaseMissing('project_volunteers', ['id' => $volunteer->id]);
});

test('accepted volunteer appears in project roles data', function () {
    Storage::fake('s3');

    $owner = User::factory()->create();
    $applicant = User::factory()->create();
    $post = \App\Models\Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);
    ProjectVolunteer::factory()->active()->create([
        'project_role_id' => $role->id,
        'user_id' => $applicant->id,
    ]);

    $this->actingAs($owner)
        ->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('project.roles.0.volunteers', 1)
            ->where('project.roles.0.volunteers.0.userId', $applicant->id)
        );
});

test('pending applicants are only visible to owner', function () {
    Storage::fake('s3');

    $owner = User::factory()->create();
    $applicant = User::factory()->create();
    $visitor = User::factory()->create();
    $post = \App\Models\Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);
    ProjectVolunteer::factory()->create([
        'project_role_id' => $role->id,
        'user_id' => $applicant->id,
        'status' => 'pending',
    ]);

    // Owner sees pending applicants
    $this->actingAs($owner)
        ->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('project.roles.0.pendingApplicants', 1)
        );

    // Visitor sees empty pending applicants
    $this->actingAs($visitor)
        ->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('project.roles.0.pendingApplicants', 0)
        );
});
