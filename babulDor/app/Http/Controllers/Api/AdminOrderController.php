<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminOrderController extends Controller
{
    // status asal => status tujuan yang diizinkan
    private const TRANSITIONS = [
        'dipesan'      => ['siap_diambil', 'dibatalkan'],
        'siap_diambil' => ['selesai', 'dibatalkan'],
    ];

    public function index()
    {
        $orders = Order::with(['buyer:id,name,class_or_position', 'items.product'])
            ->latest('id')
            ->limit(100)
            ->get();

        return response()->json(['data' => $orders->map(fn ($o) => $o->toApi())]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['siap_diambil', 'selesai', 'dibatalkan'])],
        ]);
        $admin = $request->user();

        DB::transaction(function () use ($id, $data, $admin) {
            $order = Order::with('items')->lockForUpdate()->findOrFail($id);

            if (! in_array($data['status'], self::TRANSITIONS[$order->status] ?? [], true)) {
                throw ValidationException::withMessages([
                    'status' => 'Perubahan status tidak diperbolehkan dari status saat ini.',
                ]);
            }

            if ($data['status'] === 'dibatalkan') {
                $order->restoreStockAndCancel();
            } else {
                $order->update([
                    'status'       => $data['status'],
                    'completed_at' => $data['status'] === 'selesai' ? now() : null,
                ]);
            }

            // BR-07: penjualan sah saat Selesai → catat barang keluar
            if ($data['status'] === 'selesai') {
                foreach ($order->items as $item) {
                    DB::table('stock_movements')->insert([
                        'product_id'    => $item->product_id,
                        'type'          => 'keluar',
                        'quantity'      => $item->quantity,
                        'order_id'      => $order->id,
                        'note'          => 'Penjualan pesanan #'.$order->id,
                        'created_by'    => $admin->id,
                        'movement_date' => today(),
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]);
                }
            }

            // jejak audit tindakan admin
            DB::table('activity_logs')->insert([
                'user_id'     => $admin->id,
                'action'      => 'order.'.$data['status'],
                'target_type' => 'order',
                'target_id'   => $order->id,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        });

        return response()->json(['message' => 'Status pesanan diperbarui.']);
    }
}