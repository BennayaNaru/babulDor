<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Sale;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'qty_terjual' => 'required|integer|min:1',
        ]);

        $item = Item::findOrFail($request->item_id);

        if ($request->qty_terjual > $item->stok_awal) {
            return redirect()->back()->withErrors(['msg' => 'Stok tidak mencukupi!'])->with('tab', 3);
        }

        $hargaJual = $item->harga_asli + 1000;

        Sale::create([
            'item_id' => $item->id,
            'qty_terjual' => $request->qty_terjual,
            'total_harga_jual' => $hargaJual * $request->qty_terjual,
            'tanggal' => today(),
        ]);

        $item->stok_awal -= $request->qty_terjual;
        $item->save();

        return redirect()->back()->with('success', 'Penjualan berhasil dicatat.')->with('tab', 3);
    }

    public function destroy($id)
    {
        $sale = Sale::findOrFail($id);

        $item = $sale->item;
        $item->stok_awal += $sale->qty_terjual;
        $item->save();

        $sale->delete();

        return redirect()->back()->with('success', 'Penjualan dibatalkan.')->with('tab', 3);
    }
}
