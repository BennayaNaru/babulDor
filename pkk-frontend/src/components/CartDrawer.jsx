import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import Icon from './Icon'
import { useCart } from '../context/CartContext'
import { rupiah } from '../lib/format'
import { friendlyMessage } from '../lib/errors'

export default function CartDrawer() {
    const { items, total, open, closeCart, changeQty, remove, clear } = useCart()
    const navigate = useNavigate()
    const [pickupPoints, setPickupPoints] = useState([])
    const [pickup, setPickup] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)

    useEffect(() => {
        api.get('/pickup-points')
            .then((res) => {
                setPickupPoints(res.data.data)
                setPickup(res.data.data[0] ?? '')
            })
            .catch(() => { })
    }, [])

    async function handleCheckout() {
        setError('')
        setSubmitting(true)
        try {
            const res = await api.post('/orders', {
                pickup_point: pickup,
                items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
            })
            clear()
            closeCart()
            setSuccess(res.data.data)
        } catch (err) {
            setError(friendlyMessage(err, 'Gagal membuat pesanan. Coba lagi.'))
        } finally {
            setSubmitting(false)
        }
    }

    function goToOrders() {
        setSuccess(null)
        navigate('/pesanan')
    }

    return (
        <>
            <div
                onClick={closeCart}
                className={`fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />
            <aside
                className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-surface-container-lowest shadow-2xl transform transition-transform duration-300 flex flex-col justify-between ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-5 border-b border-surface-container-highest flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon name="shopping_bag" className="text-primary text-[24px]" />
                        <h2 className="text-headline-sm font-headline-sm text-on-surface">Keranjang Belanja</h2>
                    </div>
                    <button onClick={closeCart} className="p-1.5 rounded-full hover:bg-surface-container text-secondary">
                        <Icon name="close" className="text-[20px]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="py-12 text-center text-secondary">
                            <Icon name="shopping_cart" className="text-[48px] text-surface-container-highest" />
                            <p className="font-bold text-headline-sm mt-2">Keranjangmu Kosong</p>
                            <p className="text-body-sm">Yuk pilih jajanan dan minuman buatan siswa!</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="p-3 bg-surface-container-low rounded-xl border border-surface-container-highest flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-label-md font-label-md text-on-surface truncate">{item.name}</p>
                                    <p className="text-[11px] text-secondary">{rupiah(item.price)} / pcs</p>
                                    <p className="text-label-sm font-label-sm text-primary font-bold mt-0.5">{rupiah(item.price * item.qty)}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => changeQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-surface-container-lowest border border-surface-container-highest flex items-center justify-center font-bold text-secondary hover:text-on-surface">-</button>
                                    <span className="w-6 text-center text-label-md font-bold">{item.qty}</span>
                                    <button onClick={() => changeQty(item.id, 1)} disabled={item.qty >= item.stock} className="w-7 h-7 rounded-lg bg-surface-container-lowest border border-surface-container-highest flex items-center justify-center font-bold text-secondary hover:text-on-surface disabled:opacity-40">+</button>
                                    <button onClick={() => remove(item.id)} className="p-1 text-secondary hover:text-error ml-1" title="Hapus">
                                        <Icon name="delete" className="text-[18px]" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 border-t border-surface-container-highest bg-surface-container-low space-y-3">
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-secondary uppercase">Titik Ambil Pesanan:</label>
                        {pickupPoints.length > 1 ? (
                            <select
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                                className="w-full text-body-sm font-body-sm px-3 py-2 bg-surface-container-lowest border border-surface-container-highest rounded-xl outline-none focus:border-primary"
                            >
                                {pickupPoints.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                        ) : (
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-lowest border border-surface-container-highest text-body-sm">
                                <Icon name="location_on" fill className="text-primary text-[18px]" />
                                <span className="text-xs font-semibold">{pickup || 'Memuat...'}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-secondary uppercase">Metode Pembayaran:</label>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-lowest border border-primary text-body-sm">
                            <Icon name="payments" fill className="text-primary text-[18px]" />
                            <span className="text-xs font-semibold">Tunai saat Ambil</span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-surface-container-highest space-y-1.5">
                        <div className="flex items-center justify-between text-body-sm font-body-sm">
                            <span className="text-secondary">Subtotal Pesanan:</span>
                            <span className="text-on-surface font-semibold">{rupiah(total)}</span>
                        </div>
                        <div className="flex items-center justify-between text-body-sm font-body-sm">
                            <span className="text-secondary">Biaya Layanan Koperasi:</span>
                            <span className="text-emerald-700 font-semibold">Sudah termasuk (+Rp1.000/item)</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-headline-sm font-headline-sm text-on-surface">Total Bayar:</span>
                            <span className="text-headline-md font-headline-md text-primary font-bold">{rupiah(total)}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-2.5 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md flex items-start gap-2">
                            <Icon name="error" className="text-[18px] shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={handleCheckout}
                        disabled={items.length === 0 || submitting || !pickup}
                        className="w-full py-3 rounded-xl bg-primary text-white font-label-lg hover:bg-primary-container shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon name="check_circle" className="text-[20px]" />
                        <span>{submitting ? 'Memproses...' : 'Buat Pesanan Sekarang'}</span>
                    </button>
                </div>
            </aside>

            {/* Modal pesanan berhasil */}
            {success && (
                <div className="fixed inset-0 z-[55] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-surface-container-highest shadow-2xl p-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                            <Icon name="check_circle" className="text-[36px]" />
                        </div>
                        <div>
                            <h3 className="text-headline-md font-headline-md text-on-surface">Pesanan Berhasil Dibuat!</h3>
                            <p className="text-body-sm font-body-sm text-secondary mt-1">
                                Stok telah dikunci. Silakan ambil pesanan Anda sesuai lokasi yang dipilih.
                            </p>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-highest text-left space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-secondary font-bold uppercase">No. Transaksi:</span>
                                <span className="font-bold text-primary font-label-md">#{success.number}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-secondary font-bold uppercase">Kode Ambil (Pickup PIN):</span>
                                <span className="text-headline-sm font-headline-sm font-extrabold text-on-surface tracking-widest bg-white px-2 py-0.5 rounded border border-surface-container-highest">
                                    {success.pickup_code}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-body-sm">
                                <span className="text-secondary">Lokasi:</span>
                                <span className="font-medium text-on-surface text-right">{success.pickup_point}</span>
                            </div>
                        </div>
                        <button onClick={goToOrders} className="w-full py-2.5 rounded-xl bg-primary text-white font-label-md hover:bg-primary-container shadow-sm">
                            Lihat Status di Riwayat Pesanan
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}