import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const sortOptions = [
    ['populer', 'Paling Laris'],
    ['termurah', 'Harga Terendah'],
    ['termahal', 'Harga Tertinggi'],
    ['terbaru', 'Terbaru Masuk'],
]

export default function KatalogPage() {
    const { user } = useAuth()
    const { add } = useCart()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [params, setSearchParams] = useSearchParams()
    const q = params.get('q') ?? ''
    const sectionRef = useRef(null)

    const [categories, setCategories] = useState([])
    const [categoryId, setCategoryId] = useState('all')
    const [sort, setSort] = useState('populer')
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => { })
    }, [])

    // ambil produk setiap filter berubah (ditunda 250 ms supaya tidak banjir request saat mengetik)
    useEffect(() => {
        let cancelled = false
        setLoading(true)
        const timer = setTimeout(() => {
            api
                .get('/products', {
                    params: { q: q.trim(), sort, category_id: categoryId === 'all' ? undefined : categoryId },
                })
                .then((res) => {
                    if (cancelled) return
                    setProducts(res.data.data)
                    setError('')
                })
                .catch(() => !cancelled && setError('Gagal memuat produk. Coba muat ulang halaman.'))
                .finally(() => !cancelled && setLoading(false))
        }, 250)
        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [q, categoryId, sort])

    function quickAdd(product) {
        add(product, 1)
        showToast(`${product.name} masuk keranjang`)
    }

    const supplierCount = new Set(products.map((p) => p.supplier_id)).size
    const infoStrip = [
        { icon: 'fastfood', tone: 'bg-red-50 text-primary', label: 'Menu Tersedia', value: `${products.length} Produk` },
        { icon: 'verified', tone: 'bg-amber-50 text-tertiary', label: 'Standar Higienis', value: 'Lolos Uji Pengurus' },
        { icon: 'payments', tone: 'bg-emerald-50 text-emerald-700', label: 'Pembayaran Praktis', value: 'Tunai saat Ambil' },
        { icon: 'school', tone: 'bg-blue-50 text-blue-700', label: 'Karya Siswa Aktif', value: `${supplierCount} Pemasok` },
    ]

    return (
        <section className="space-y-6">
            <div className="relative lg:hidden">
                <Icon name="search" className="absolute left-3 top-3 text-secondary text-[20px]" />
                <input
                    type="text"
                    value={q}
                    onChange={(e) => {
                        const v = e.target.value
                        setSearchParams(v ? { q: v } : {}, { replace: true })
                    }}
                    placeholder="Cari risol, es teh..."
                    className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest rounded-xl text-body-md border border-surface-container-highest focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
            </div>
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-[#dc2626] text-white p-6 md:p-8 shadow-sm">
                <div className="max-w-2xl relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-label-sm font-label-sm">
                        <Icon name="storefront" className="text-[16px]" />
                        <span>Gelar Karya Kewirausahaan Siswa SMK</span>
                    </div>
                    <h1 className="text-headline-lg md:text-display-lg font-headline-lg md:font-display-lg leading-tight">
                        Dukung Kreativitas & Wirausaha Sekolah
                    </h1>
                    <p className="text-body-md font-body-md text-white/90">
                        Nikmati jajanan higienis, minuman segar buatan siswa tata boga, serta suvenir karya jurusan kriya langsung dari kantin PKK.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                        <button
                            onClick={() => sectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-surface-container-lowest text-primary font-label-lg px-5 py-2.5 rounded-xl hover:bg-surface-bright transition-all shadow-sm flex items-center gap-2"
                        >
                            <span>Jelajahi Menu Hari Ini</span>
                            <Icon name="arrow_forward" className="text-[18px]" />
                        </button>

                        {user.role === 'user' && (
                            <button
                                onClick={() => navigate('/ajukan')}
                                className="bg-black/25 backdrop-blur-sm border border-white/40 hover:bg-black/35 text-white font-label-lg px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
                            >
                                <Icon name="upload" className="text-[18px]" />
                                <span>Titip Jual Produkmu</span>
                            </button>
                        )}
                    </div>
                </div>
                <div className="absolute right-0 -bottom-10 opacity-15 pointer-events-none transform translate-x-12 select-none">
                    <Icon name="local_mall" className="text-[280px]" />
                </div>
            </div>

            {/* Info strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {infoStrip.map((s) => (
                    <div key={s.label} className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container-highest flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.tone}`}>
                            <Icon name={s.icon} />
                        </div>
                        <div>
                            <p className="text-[11px] text-secondary">{s.label}</p>
                            <p className="text-headline-sm font-headline-sm text-on-surface">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & sort */}
            <div ref={sectionRef} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 scroll-mt-20">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {[{ id: 'all', name: 'Semua' }, ...categories].map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setCategoryId(c.id)}
                            className={`px-4 py-2 rounded-xl text-label-md font-label-md transition-all shrink-0 ${categoryId === c.id
                                ? 'bg-primary text-white'
                                : 'bg-surface-container-low text-secondary hover:text-on-surface'
                                }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-body-sm font-body-sm text-secondary">Urutkan:</span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="bg-surface-container-lowest border border-surface-container-highest rounded-xl text-body-sm font-body-sm px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
                    >
                        {sortOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                </div>
            </div>

            {/* Grid */}
            {
                error && (
                    <div className="p-3 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md">{error}</div>
                )
            }

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {loading && products.length === 0
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4] rounded-2xl bg-surface-container animate-pulse" />
                    ))
                    : products.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            isOwn={p.supplier_id === user.id}
                            onOpen={setSelected}
                            onAdd={quickAdd}
                        />
                    ))}

                {!loading && !error && products.length === 0 && (
                    <div className="col-span-full py-12 text-center text-secondary">
                        <Icon name="search_off" className="text-[48px] text-surface-container-highest" />
                        <p className="text-headline-sm font-headline-sm mt-2">Produk tidak ditemukan</p>
                        <p className="text-body-sm">Coba kata kunci pencarian lain atau pilih kategori Semua.</p>
                    </div>
                )}
            </div>

            {
                selected && (
                    <ProductDetailModal
                        key={selected.id}
                        product={selected}
                        isOwn={selected.supplier_id === user.id}
                        onClose={() => setSelected(null)}
                    />
                )
            }
        </section >
    )
}