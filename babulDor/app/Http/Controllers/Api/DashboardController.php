<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\SalesReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request, SalesReport $report)
    {
        $today = today();
        $todayStr = $today->toDateString();
        $yesterdayStr = $today->copy()->subDay()->toDateString();

        $todayReport = $report->build($todayStr, $todayStr);
        $yesterdayRevenue = $report->build($yesterdayStr, $yesterdayStr)['summary']['revenue'];

        // omzet 7 hari terakhir (hanya pesanan Selesai)
        $byDay = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', 'selesai')
            ->whereRaw('DATE(orders.completed_at) >= ?', [$today->copy()->subDays(6)->toDateString()])
            ->selectRaw('DATE(orders.completed_at) as day, SUM(order_items.quantity * order_items.display_price_snapshot) as revenue')
            ->groupByRaw('DATE(orders.completed_at)')
            ->pluck('revenue', 'day');

        $series = collect(range(6, 0))->map(function ($i) use ($today, $byDay) {
            $date = $today->copy()->subDays($i)->toDateString();

            return ['date' => $date, 'revenue' => (int) ($byDay[$date] ?? 0)];
        })->values();

        // antrean verifikasi hanya untuk pengurus
        $pending = null;
        if ($request->user()->role === 'admin_pengurus') {
            $pending = [
                'count' => Product::where('status', 'menunggu')->count(),
                'items' => Product::with('supplier:id,name,class_or_position')
                    ->where('status', 'menunggu')
                    ->oldest('id')
                    ->limit(3)
                    ->get()
                    ->map(fn ($p) => [
                        'id'             => $p->id,
                        'name'           => $p->name,
                        'stock'          => $p->stock,
                        'supplier_class' => $p->supplier->class_or_position,
                    ]),
            ];
        }

        return response()->json(['data' => [
            'today' => $todayReport['summary'] + [
                'suppliers_in' => $todayReport['rows']->where('in', '>', 0)->pluck('supplier_id')->unique()->count(),
            ],
            'yesterday_revenue' => $yesterdayRevenue,
            'series'            => $series,
            'pending'           => $pending,
            'active_orders'     => Order::whereIn('status', ['dipesan', 'siap_diambil'])->count(),
        ]]);
    }
}