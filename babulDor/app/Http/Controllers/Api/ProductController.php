<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // Pastikan facade ini di-import jika pakai Storage::url

class ProductController extends Controller
{
    public function categories()
    {
        return response()->json(['data' => Category::orderBy('id')->get(['id', 'name'])]);
    }

    public function index(Request $request)
    {
        $query = $this->baseQuery();

        if ($search = trim($request->query('q', ''))) {
            $query->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        match ($request->query('sort', 'populer')) {
            'termurah' => $query->orderBy('display_price'),
            'termahal' => $query->orderByDesc('display_price'),
            'terbaru'  => $query->latest(),
            default    => $query->orderByDesc('sold_count')->latest(),
        };

        return response()->json([
            'data' => $query->get()->map(fn ($p) => $this->transform($p)),
        ]);
    }

    public function show(int $id)
    {
        return response()->json(['data' => $this->transform($this->baseQuery()->findOrFail($id))]);
    }

    private function baseQuery()
    {
        return Product::approved()
            ->with(['category:id,name', 'supplier:id,name,class_or_position'])
            ->withSum(['orderItems as sold_count' => function ($q) {
                $q->whereHas('order', fn ($o) => $o->where('status', 'selesai'));
            }], 'quantity');
    }

    private function transform(Product $p): array
    {
        return [
            'id'             => $p->id,
            'name'           => $p->name,
            'description'    => $p->description,
            'category'       => ['id' => $p->category->id, 'name' => $p->category->name],
            'supplier_id'    => $p->supplier_id,
            'supplier_name'  => $p->supplier->name,
            'supplier_class' => $p->supplier->class_or_position,
            'price'          => $p->display_price,
            'stock'          => $p->stock,
            // PERBAIKAN DI SINI: Menggunakan asset() agar menghasilkan URL lengkap
            'image_url'      => $p->image ? asset('storage/' . $p->image) : null,
            'sold_count'     => (int) ($p->sold_count ?? 0),
        ];
    }
}
