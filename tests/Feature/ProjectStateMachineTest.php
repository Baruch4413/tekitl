<?php

use App\Models\Project;
use App\ProjectStage;

test('project defaults to planning stage', function () {
    $project = Project::factory()->create();

    expect($project->stage)->toBe(ProjectStage::Planning);
});

test('start transitions planning to in_execution', function () {
    $project = Project::factory()->create();

    $project->start();

    expect($project->fresh()->stage)->toBe(ProjectStage::InExecution);
});

test('complete transitions in_execution to completed', function () {
    $project = Project::factory()->create(['stage' => ProjectStage::InExecution]);

    $project->complete();

    expect($project->fresh()->stage)->toBe(ProjectStage::Completed);
});

test('abort works from planning', function () {
    $project = Project::factory()->create();

    $project->abort();

    expect($project->fresh()->stage)->toBe(ProjectStage::Aborted);
});

test('abort works from in_execution', function () {
    $project = Project::factory()->create(['stage' => ProjectStage::InExecution]);

    $project->abort();

    expect($project->fresh()->stage)->toBe(ProjectStage::Aborted);
});

test('invalid transition throws InvalidArgumentException', function () {
    $project = Project::factory()->create();

    expect(fn () => $project->complete())->toThrow(InvalidArgumentException::class);
});

test('cannot transition out of a terminal state', function () {
    $project = Project::factory()->create(['stage' => ProjectStage::Completed]);

    expect(fn () => $project->abort())->toThrow(InvalidArgumentException::class);
});
