<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class AutoLogout
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $loginTime = session('login_time');

            
            if ($loginTime && Carbon::parse($loginTime)->toDateString() !== now()->toDateString()) {
                Auth::logout();
                session()->flush();
                return redirect('/login')->with('message', 'Sesi berakhir karena pergantian hari.');
            }
        }

        return $next($request);
    }
}
