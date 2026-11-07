<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Sale;
use App\Models\ProfitNote;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $sekarang = Carbon::now();
        $batasWaktu = Carbon::today()->setHour(15)->setMinute(0)->setSecond(0);

        $isTutupBuku = $sekarang->greaterThan($batasWaktu);

        if ($isTutupBuku) {
            $items = collect();
        } else {
            $items = Item::whereDate('tanggal', today())
                         ->orderBy('nama_barang', 'asc')
                         ->get();
        }

        $profitNotes = ProfitNote::whereDate('tanggal', today())->get();
        $totalLabaManual = $profitNotes->sum(function($note) {
            return $note->qty * $note->laba_per_pcs;
        });

        $penjualanHariIni = Sale::whereDate('tanggal', today())->with('item')->get();

        $totalLabaPenjualan = 0;
        foreach ($penjualanHariIni as $sale) {
            $totalLabaPenjualan += ($sale->total_harga_jual - ($sale->item->harga_asli * $sale->qty_terjual));
        }

        $totalLabaKeseluruhan = $totalLabaManual + $totalLabaPenjualan;

        $totalPemasok = $items->sum(function($item) {
            return $item->harga_asli * $item->stok_awal;
        });

        $totalLabaPotensial = $items->sum(function($item) {
            return 1000 * $item->stok_awal;
        });

        return view('dashboard', compact(
            'items',
            'profitNotes',
            'totalLabaManual',
            'penjualanHariIni',
            'totalLabaKeseluruhan',
            'totalPemasok',
            'totalLabaPotensial',
            'isTutupBuku'
        ));
    }
}
