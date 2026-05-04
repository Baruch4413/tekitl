<?php

use App\Models\Project;
use App\Models\ProjectRole;
use App\Models\ProjectTimelineEvent;
use App\Models\ProjectVolunteer;
use App\Models\User;
use App\ProjectStage;
use App\ProjectTimelineEventType;

test('applications are rejected on completed projects with 403', function () {
    $owner = User::factory()->create();
    $applicant = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Completed,
    ]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 5]);

    $this->actingAs($applicant)
        ->post(route('proyectos.volunteers.store', [$project, $role]))
        ->assertForbidden();

    $this->assertDatabaseMissing('project_volunteers', [
        'project_role_id' => $role->id,
        'user_id' => $applicant->id,
    ]);
});

test('applications are rejected on aborted projects with 403', function () {
    $owner = User::factory()->create();
    $applicant = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Aborted,
    ]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 5]);

    $this->actingAs($applicant)
        ->post(route('proyectos.volunteers.store', [$project, $role]))
        ->assertForbidden();
});

test('applications are accepted on in_execution projects', function () {
    $owner = User::factory()->create();
    $applicant = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::InExecution,
    ]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 5]);

    $this->actingAs($applicant)
        ->post(route('proyectos.volunteers.store', [$project, $role]))
        ->assertRedirect();

    $this->assertDatabaseHas('project_volunteers', [
        'project_role_id' => $role->id,
        'user_id' => $applicant->id,
        'status' => 'pending',
    ]);
});

test('terminal transition auto-rejects pending volunteers', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::InExecution,
    ]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 5]);

    $pendingA = ProjectVolunteer::factory()->create([
        'project_role_id' => $role->id,
        'status' => 'pending',
    ]);
    $pendingB = ProjectVolunteer::factory()->create([
        'project_role_id' => $role->id,
        'status' => 'pending',
    ]);

    $this->actingAs($owner)
        ->post(route('proyectos.stage.store', $project), ['to' => 'completed'])
        ->assertRedirect();

    expect($pendingA->fresh()->status)->toBe('bailed');
    expect($pendingB->fresh()->status)->toBe('bailed');
});

test('terminal transition retains active volunteers', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::InExecution,
    ]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 5]);

    $active = ProjectVolunteer::factory()->active()->create([
        'project_role_id' => $role->id,
    ]);

    $this->actingAs($owner)
        ->post(route('proyectos.stage.store', $project), ['to' => 'completed']);

    expect($active->fresh()->status)->toBe('active');
});

test('one volunteer_bailed event recorded per auto-rejected application', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::InExecution,
    ]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 5]);

    ProjectVolunteer::factory()->count(3)->create([
        'project_role_id' => $role->id,
        'status' => 'pending',
    ]);

    $this->actingAs($owner)
        ->post(route('proyectos.stage.store', $project), ['to' => 'aborted']);

    $events = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::VolunteerBailed)
        ->get();

    expect($events)->toHaveCount(3);
    foreach ($events as $event) {
        expect($event->data['reason'])->toBe('auto_rejected_terminal_stage');
        expect($event->user_id)->toBeNull();
    }
});

test('non-terminal transition does not auto-reject pending volunteers', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id, 'slots' => 5]);

    $pending = ProjectVolunteer::factory()->create([
        'project_role_id' => $role->id,
        'status' => 'pending',
    ]);

    $this->actingAs($owner)
        ->post(route('proyectos.stage.store', $project), ['to' => 'in_execution']);

    expect($pending->fresh()->status)->toBe('pending');
});
