<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect('/dashboard');
        }
        return view('login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'kelas' => 'required',
            'nisn' => 'required',
            'nis' => 'required',
        ]);

        $user = User::where('name', $request->name)
                    ->where('kelas', $request->kelas)
                    ->where('nisn', $request->nisn)
                    ->where('nis', $request->nis)
                    ->first();

        if ($user) {
            Auth::login($user);
            $request->session()->regenerate();
            session(['login_time' => now()]);
            return redirect('/dashboard');
        }

        return back()->withErrors(['msg' => 'Data Admin tidak cocok!'])->withInput();
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->flush();
        return redirect('/login');
    }
}
