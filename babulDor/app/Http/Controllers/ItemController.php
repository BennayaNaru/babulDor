<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nama_barang' => 'required',
            'harga_asli' => 'required|integer|min:0',
            'stok_awal' => 'required|integer|min:0',
        ]);

        Item::create([
            'nama_barang' => $request->nama_barang,
            'harga_asli' => $request->harga_asli,
            'stok_awal' => $request->stok_awal,
            'tanggal' => today(),
        ]);

        return redirect()->back()->with('success', 'Barang berhasil ditambahkan.')->with('tab', 1);
    }

    public function destroy($id)
    {
        Item::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Barang berhasil dihapus.')->with('tab', 1);
    }
}
