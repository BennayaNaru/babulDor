<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MyProductController extends Controller
{
    private const MESSAGES = [
        'required'    => ':attribute wajib diisi.',
        'integer'     => ':attribute harus berupa angka bulat.',
        'exists'      => ':attribute tidak valid.',
        'image'       => ':attribute harus berupa gambar.',
        'mimes'       => ':attribute harus berformat JPG, PNG, atau WEBP.',
        'uploaded'    => ':attribute gagal diunggah (maksimal 2 MB).',
        'min.string'  => ':attribute minimal :min karakter.',
        'max.string'  => ':attribute maksimal :max karakter.',
        'min.numeric' => ':attribute minimal :min.',
        'max.numeric' => ':attribute maksimal :max.',
        'max.file'    => ':attribute maksimal 2 MB.',
    ];

    private const ATTRIBUTES = [
        'name'           => 'Nama produk',
        'category_id'    => 'Kategori',
        'description'    => 'Deskripsi',
        'supplier_price' => 'Harga pemasok',
        'stock'          => 'Stok',
        'image'          => 'Foto produk',
    ];

    public function index(Request $request)
    {
        $products = Product::with('category:id,name')
            ->where('supplier_id', $request->user()->id)
            ->latest('id')
            ->get();

        return response()->json(['data' => $products->map(fn ($p) => $p->toManageApi())]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $product = Product::create($data + [
            'supplier_id' => $request->user()->id,
            'status'      => 'menunggu',   // BR-03: belum tampil di katalog sebelum di-ACC
            'image'       => $request->hasFile('image')
                ? $request->file('image')->store('products', 'public')
                : null,
        ]);

        return response()->json([
            'message' => 'Pengajuan terkirim.',
            'data'    => $product->load('category:id,name')->toManageApi(),
        ], 201);
    }

    // Edit + ajukan ulang. Memakai POST karena PHP tidak membaca file upload lewat PUT.
    public function update(Request $request, int $id)
    {
        $product = Product::where('supplier_id', $request->user()->id)->findOrFail($id);

        if ($product->status !== 'ditolak') {
            throw ValidationException::withMessages([
                'status' => 'Hanya dagangan yang ditolak yang bisa diedit dan diajukan ulang.',
            ]);
        }

        $data = $this->validated($request);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data + ['status' => 'menunggu', 'rejection_reason' => null]);

        return response()->json([
            'message' => 'Dagangan diajukan ulang.',
            'data'    => $product->load('category:id,name')->toManageApi(),
        ]);
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name'           => ['required', 'string', 'max:120'],
            'category_id'    => ['required', 'integer', 'exists:categories,id'],
            'description'    => ['required', 'string', 'min:10', 'max:1000'],
            'supplier_price' => ['required', 'integer', 'min:1000', 'max:1000000'],
            'stock'          => ['required', 'integer', 'min:1', 'max:150'],
            'image'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ], self::MESSAGES, self::ATTRIBUTES);

        unset($data['image']);   // file ditangani terpisah di store/update

        return $data;
    }
}