<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SalesReport
{
    public function build(string $from, string $to, ?int $supplierId = null): array
    {
        // barang masuk & penyesuaian pada periode
        $moves = DB::table('stock_movements')
            ->whereBetween('movement_date', [$from, $to])
            ->whereIn('type', ['masuk', 'penyesuaian'])
            ->select('product_id', 'type', DB::raw('SUM(quantity) as qty'))
            ->groupBy('product_id', 'type')
            ->get();
        $in  = $moves->where('type', 'masuk')->pluck('qty', 'product_id');
        $adj = $moves->where('type', 'penyesuaian')->pluck('qty', 'product_id');

        // penjualan pada periode: hanya pesanan Selesai (BR-07), harga dari snapshot
        $sales = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', 'selesai')
            ->whereRaw('DATE(orders.completed_at) BETWEEN ? AND ?', [$from, $to])
            ->select(
                'order_items.product_id',
                DB::raw('SUM(order_items.quantity) as qty'),
                DB::raw('SUM(order_items.quantity * order_items.display_price_snapshot) as revenue'),
                DB::raw('SUM(order_items.quantity * order_items.supplier_price_snapshot) as supplier_share'),
                DB::raw('SUM(order_items.profit_snapshot) as profit')
            )
            ->groupBy('order_items.product_id')
            ->get()
            ->keyBy('product_id');

        // sisa stok tercatat sampai akhir periode
        $left = DB::table('stock_movements')
            ->where('movement_date', '<=', $to)
            ->select('product_id', DB::raw("SUM(CASE WHEN type = 'keluar' THEN -quantity ELSE quantity END) as qty"))
            ->groupBy('product_id')
            ->pluck('qty', 'product_id');

        $ids = $in->keys()
            ->merge($adj->keys())
            ->merge($sales->keys())
            ->merge($left->filter(fn ($q) => $q > 0)->keys())
            ->unique()
            ->values();

        $products = Product::withTrashed()
            ->with('supplier:id,name,class_or_position')
            ->whereIn('id', $ids)
            ->when($supplierId, fn ($q) => $q->where('supplier_id', $supplierId))
            ->orderBy('name')
            ->get();

        $rows = $products->map(function (Product $p) use ($in, $adj, $sales, $left) {
            $s = $sales->get($p->id);

            return [
                'product_id'     => $p->id,
                'product'        => $p->name,
                'supplier_id'    => $p->supplier_id,
                'supplier'       => $p->supplier->name,
                'supplier_class' => $p->supplier->class_or_position,
                'in'             => (int) ($in[$p->id] ?? 0),
                'out'            => (int) ($s->qty ?? 0),
                'adjust'         => (int) ($adj[$p->id] ?? 0),
                'left'           => (int) ($left[$p->id] ?? 0),
                'supplier_price' => $p->supplier_price,
                'display_price'  => $p->display_price,
                'revenue'        => (int) ($s->revenue ?? 0),
                'supplier_share' => (int) ($s->supplier_share ?? 0),
                'profit'         => (int) ($s->profit ?? 0),
            ];
        })->values();

        $adjustments = DB::table('stock_movements as m')
            ->join('products as p', 'p.id', '=', 'm.product_id')
            ->join('users as u', 'u.id', '=', 'm.created_by')
            ->where('m.type', 'penyesuaian')
            ->whereBetween('m.movement_date', [$from, $to])
            ->when($supplierId, fn ($q) => $q->where('p.supplier_id', $supplierId))
            ->orderByDesc('m.id')
            ->get(['m.id', 'm.quantity', 'm.note', 'm.movement_date', 'p.name as product', 'u.name as admin_name']);

        $suppliers = User::whereIn('id', Product::withTrashed()->select('supplier_id'))
            ->orderBy('name')
            ->get(['id', 'name', 'class_or_position']);

        return [
            'from'  => $from,
            'to'    => $to,
            'summary' => [
                'units_in'       => $rows->sum('in'),
                'units_sold'     => $rows->sum('out'),
                'units_left'     => $rows->sum('left'),
                'revenue'        => $rows->sum('revenue'),
                'supplier_share' => $rows->sum('supplier_share'),
                'profit'         => $rows->sum('profit'),
            ],
            'rows'        => $rows,
            'adjustments' => $adjustments,
            'suppliers'   => $suppliers,
        ];
    }
}