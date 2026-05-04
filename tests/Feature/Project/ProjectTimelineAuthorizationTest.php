<?php

use App\Models\Project;
use App\Models\User;
use App\ProjectStage;

test('non-owner cannot transition project stage', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);

    $this->actingAs($stranger)
        ->post(route('proyectos.stage.store', $project), ['to' => 'in_execution'])
        ->assertForbidden();

    expect($project->fresh()->stage)->toBe(ProjectStage::Planning);
});

test('guest cannot transition project stage', function () {
    $project = Project::factory()->create(['stage' => ProjectStage::Planning]);

    $this->post(route('proyectos.stage.store', $project), ['to' => 'in_execution'])
        ->assertRedirect(route('login'));

    expect($project->fresh()->stage)->toBe(ProjectStage::Planning);
});

test('owner can transition project stage', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);

    $this->actingAs($owner)
        ->post(route('proyectos.stage.store', $project), ['to' => 'in_execution'])
        ->assertRedirect();

    expect($project->fresh()->stage)->toBe(ProjectStage::InExecution);
});
