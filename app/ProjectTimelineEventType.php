<?php

namespace App;

enum ProjectTimelineEventType: string
{
    case RoleCreated = 'role_created';
    case VolunteerJoined = 'volunteer_joined';
    case VolunteerBailed = 'volunteer_bailed';
    case VolunteerExhausted = 'volunteer_exhausted';
    case Milestone = 'milestone';
    case StatusUpdate = 'status_update';
    case PhotoUploaded = 'photo_uploaded';
    case CoinsReceived = 'coins_received';
    case StageTransition = 'stage_transition';
}
