<?php

use App\ProjectStage;

test('planning can transition to in_execution or aborted', function () {
    expect(ProjectStage::Planning->canTransitionTo(ProjectStage::InExecution))->toBeTrue();
    expect(ProjectStage::Planning->canTransitionTo(ProjectStage::Aborted))->toBeTrue();
    expect(ProjectStage::Planning->canTransitionTo(ProjectStage::Completed))->toBeFalse();
});

test('in_execution can transition to completed or aborted', function () {
    expect(ProjectStage::InExecution->canTransitionTo(ProjectStage::Completed))->toBeTrue();
    expect(ProjectStage::InExecution->canTransitionTo(ProjectStage::Aborted))->toBeTrue();
    expect(ProjectStage::InExecution->canTransitionTo(ProjectStage::Planning))->toBeFalse();
});

test('completed and aborted are terminal states', function () {
    expect(ProjectStage::Completed->allowedTransitions())->toBeEmpty();
    expect(ProjectStage::Aborted->allowedTransitions())->toBeEmpty();
});
