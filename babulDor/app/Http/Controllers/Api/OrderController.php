<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function pickupPoints()
    {
        return response()->json(['data' => Order::PICKUP_POINTS]);
    }

    public function index(Request $request)
    {
        $orders = Order::with('items.product')
            ->where('buyer_id', $request->user()->id)
            ->latest('id')
            ->get();

        return response()->json(['data' => $orders->map(fn ($o) => $o->toApi())]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'pickup_point'       => ['required', Rule::in(Order::PICKUP_POINTS)],
            'items'              => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity'   => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $user = $request->user();

        $order = DB::transaction(function () use ($data, $user) {
            // gabungkan jika produk yang sama muncul dua kali
            $wanted = collect($data['items'])
                ->groupBy('product_id')
                ->map(fn ($rows) => $rows->sum('quantity'));

            // kunci baris produk agar dua pembeli tidak bisa mengambil stok terakhir bersamaan
            $products = Product::whereIn('id', $wanted->keys())->lockForUpdate()->get()->keyBy('id');

            $total = 0;
            $lines = [];

            foreach ($wanted as $productId => $qty) {
                $p = $products->get($productId);

                if (! $p || $p->status !== 'disetujui') {
                    throw ValidationException::withMessages([
                        'items' => 'Ada produk yang sudah tidak tersedia. Muat ulang katalog.',
                    ]);
                }
                if ($p->supplier_id === $user->id) {
                    throw ValidationException::withMessages([
                        'items' => "Kamu tidak bisa membeli produkmu sendiri ({$p->name}).",
                    ]);
                }
                if ($p->stock < $qty) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$p->name} tidak cukup (sisa {$p->stock}).",
                    ]);
                }

                $total += $p->display_price * $qty;
                $lines[] = [$p, $qty];
            }

            $order = Order::create([
                'buyer_id'     => $user->id,
                'status'       => 'dipesan',
                'total_price'  => $total,
                'pickup_point' => $data['pickup_point'],
                'pickup_code'  => random_int(100, 999).'-PKK',
            ]);

            foreach ($lines as [$p, $qty]) {
                $order->items()->create([
                    'product_id'              => $p->id,
                    'quantity'                => $qty,
                    'supplier_price_snapshot' => $p->supplier_price,
                    'display_price_snapshot'  => $p->display_price,
                    'profit_snapshot'         => Product::PKK_PROFIT * $qty,
                ]);

                $p->decrement('stock', $qty);   // BR-08
            }

            return $order;
        });

        return response()->json([
            'message' => 'Pesanan berhasil dibuat.',
            'data'    => $order->load('items.product')->toApi(),
        ], 201);
    }

    public function cancel(Request $request, int $id)
    {
        DB::transaction(function () use ($request, $id) {
            $order = Order::where('buyer_id', $request->user()->id)->lockForUpdate()->findOrFail($id);

            if (! in_array($order->status, ['dipesan', 'siap_diambil'], true)) {
                throw ValidationException::withMessages(['status' => 'Pesanan ini tidak bisa dibatalkan.']);
            }

            $order->restoreStockAndCancel();
        });

        return response()->json(['message' => 'Pesanan dibatalkan.']);
    }
}