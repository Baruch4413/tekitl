<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileInfoRequest;
use Illuminate\Http\RedirectResponse;

class UserProfileInfoController extends Controller
{
    public function update(UpdateProfileInfoRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        return back();
    }
}
