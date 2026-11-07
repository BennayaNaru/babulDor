<?php

namespace App\Http\Controllers;

use App\Models\ProfitNote;
use Illuminate\Http\Request;

class ProfitNoteController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nama_barang' => 'required',
            'jam_jual' => 'required',
            'qty' => 'required|integer|min:1',
            'laba_per_pcs' => 'required|integer|min:0',
        ]);

        ProfitNote::create([
            'nama_barang' => $request->nama_barang,
            'jam_jual' => $request->jam_jual,
            'qty' => $request->qty,
            'laba_per_pcs' => $request->laba_per_pcs,
            'tanggal' => today(),
        ]);

        return redirect()->back()->with('success', 'Catatan laba berhasil ditambahkan.')->with('tab', 2);
    }

    public function destroy($id)
    {
        ProfitNote::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Catatan laba dihapus.')->with('tab', 2);
    }
}
