@extends('layout')

@section('content')
<div class="min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center">Login Admin PKK</h1>

        @if(session('message'))
            <div class="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">{{ session('message') }}</div>
        @endif

        @if($errors->any())
            <div class="bg-red-100 text-red-800 p-3 rounded mb-4">
                @foreach($errors->all() as $error)
                    <p>{{ $error }}</p>
                @endforeach
            </div>
        @endif

        <form method="POST" action="/login">
            @csrf
            <div class="mb-4">
                <label class="block mb-1 font-semibold">Nama Lengkap</label>
                <input type="text" name="name" value="{{ old('name') }}" class="w-full border rounded px-3 py-2" required>
            </div>
            <div class="mb-4">
                <label class="block mb-1 font-semibold">Kelas</label>
                <input type="text" name="kelas" value="{{ old('kelas') }}" class="w-full border rounded px-3 py-2" required>
            </div>
            <div class="mb-4">
                <label class="block mb-1 font-semibold">NISN</label>
                <input type="text" name="nisn" value="{{ old('nisn') }}" class="w-full border rounded px-3 py-2" required>
            </div>
            <div class="mb-6">
                <label class="block mb-1 font-semibold">NIS</label>
                <input type="text" name="nis" value="{{ old('nis') }}" class="w-full border rounded px-3 py-2" required>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        </form>
    </div>
</div>
@endsection
