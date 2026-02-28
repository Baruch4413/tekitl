<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

class UserObserver
{
    public function saving(User $user): void
    {
        if ($user->isDirty('avatar')) {
            $user->avatar_url = $user->avatar
                ? Storage::disk('s3')->url($user->avatar)
                : null;
        }
    }
}
