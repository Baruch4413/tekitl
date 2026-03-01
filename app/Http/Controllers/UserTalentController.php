<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTalentRequest;
use App\Http\Requests\UpdateTalentRequest;
use App\Models\UserTalent;
use Illuminate\Http\RedirectResponse;

class UserTalentController extends Controller
{
    public function store(StoreTalentRequest $request): RedirectResponse
    {
        $request->user()->talents()->create($request->validated());

        return back();
    }

    public function update(UpdateTalentRequest $request, UserTalent $talent): RedirectResponse
    {
        abort_unless($talent->user_id === $request->user()->id, 403);

        $talent->update($request->validated());

        return back();
    }

    public function destroy(UserTalent $talent): RedirectResponse
    {
        abort_unless($talent->user_id === request()->user()->id, 403);

        $talent->delete();

        return back();
    }
}
