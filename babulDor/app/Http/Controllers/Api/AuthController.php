<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'identifier' => ['required', 'string'],
            'name'       => ['required', 'string'],
            'kelas'      => ['required', 'string'],
        ]);

        // samakan huruf besar-kecil dan spasi ganda saat membandingkan
        $norm = fn($s) => mb_strtolower(preg_replace('/\s+/', ' ', trim((string) $s)));

        $user = User::where('identifier', trim($data['identifier']))
            ->where('is_active', true)
            ->first();

        if (
            ! $user
            || $norm($user->name) !== $norm($data['name'])
            || $norm($user->class_or_position) !== $norm($data['kelas'])
        ) {
            // pesan sengaja umum, tidak membocorkan field mana yang salah
            return response()->json([
                'message' => 'Data tidak cocok dengan akun terdaftar. Periksa NISN/NIP, nama, dan kelas/jabatan.',
            ], 422);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'data' => ['token' => $token, 'user' => $user],
            'message' => 'Login berhasil',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(['data' => $request->user()]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil']);
    }
}
