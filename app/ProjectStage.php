<?php

namespace App;

enum ProjectStage: string
{
    case Planning = 'planning';
    case InExecution = 'in_execution';
    case Completed = 'completed';
    case Aborted = 'aborted';

    /**
     * @return array<ProjectStage>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Planning => [self::InExecution, self::Aborted],
            self::InExecution => [self::Completed, self::Aborted],
            self::Completed, self::Aborted => [],
        };
    }

    public function canTransitionTo(self $stage): bool
    {
        return in_array($stage, $this->allowedTransitions(), true);
    }

    public function label(): string
    {
        return __('projects.stage.label.'.$this->value);
    }
}
