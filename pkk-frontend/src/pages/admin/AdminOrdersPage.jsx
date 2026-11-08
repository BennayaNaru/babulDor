import { useCallback, useEffect, useState } from 'react'
import api from '../../lib/api'
import Icon from '../../components/Icon'
import { useToast } from '../../context/ToastContext'
import { formatDateTime, rupiah } from '../../lib/format'
import { statusInfo } from '../../lib/orderStatus'

const tabs = [
    { key: 'aktif', label: 'Aktif', match: (o) => o.status === 'dipesan' || o.status === 'siap_diambil' },
    { key: 'selesai', label: 'Selesai', match: (o) => o.status === 'selesai' },
    { key: 'dibatalkan', label: 'Dibatalkan', match: (o) => o.status === 'dibatalkan' },
    { key: 'semua', label: 'Semua', match: () => true },
]

export default function AdminOrdersPage() {
    const { showToast } = useToast()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [tab, setTab] = useState('aktif')
    const [q, setQ] = useState('')
    const [busyId, setBusyId] = useState(null)

    const load = useCallback(() => {
        return api.get('/admin/orders')
            .then((res) => {
                setOrders(res.data.data)
                setError('')
            })
            .catch(() => setError('Gagal memuat pesanan.'))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        load()
        const timer = setInterval(load, 15000)
        return () => clearInterval(timer)
    }, [load])

    async function changeStatus(order, status) {
        if (status === 'dibatalkan' && !window.confirm(`Batalkan pesanan #${order.number}? Stok akan dikembalikan.`)) return
        setBusyId(order.id)
        try {
            await api.patch(`/admin/orders/${order.id}/status`, { status })
            showToast(`Pesanan #${order.number} → ${statusInfo[status].label}`)
            await load()
        } catch (err) {
            window.alert(friendlyMessage(err, 'Gagal mengubah status.'))
        } finally {
            setBusyId(null)
        }
    }

    const activeTab = tabs.find((t) => t.key === tab)
    const keyword = q.trim().toLowerCase()
    const visible = orders.filter(
        (o) =>
            activeTab.match(o) &&
            (!keyword || [o.number, o.pickup_code, o.buyer?.name].some((v) => v?.toLowerCase().includes(keyword)))
    )

    return (
        <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-headline-md font-headline-md text-on-surface">Kelola Pesanan</h1>
                    <p className="text-body-sm font-body-sm text-secondary">
                        Siapkan pesanan, tandai siap diambil, lalu selesaikan saat pembeli mengambil. Penjualan dan laba tercatat saat Selesai.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Icon name="search" className="absolute left-3 top-2.5 text-secondary text-[18px]" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Cari no. pesanan, kode ambil, nama..."
                        className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest rounded-xl text-body-sm font-body-sm border border-surface-container-highest focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 rounded-xl text-label-md font-label-md transition-all shrink-0 ${tab === t.key ? 'bg-primary text-white' : 'bg-surface-container-low text-secondary hover:text-on-surface'
                            }`}
                    >
                        {t.label} ({orders.filter(t.match).length})
                    </button>
                ))}
            </div>

            {error && <div className="p-3 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md">{error}</div>}

            <div className="space-y-4">
                {loading && orders.length === 0 && <div className="h-40 rounded-2xl bg-surface-container animate-pulse" />}

                {!loading && !error && visible.length === 0 && (
                    <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container-highest text-center text-secondary">
                        <Icon name="receipt_long" className="text-[48px] text-surface-container-highest" />
                        <p className="font-bold text-headline-sm mt-2">Tidak ada pesanan</p>
                        <p className="text-body-sm">Pesanan yang cocok dengan filter akan muncul di sini.</p>
                    </div>
                )}

                {visible.map((ord) => (
                    <div key={ord.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-highest shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container-highest pb-3">
                            <div>
                                <span className="text-label-sm font-label-sm font-bold text-primary mr-2">#{ord.number}</span>
                                <span className="text-body-sm text-secondary">{formatDateTime(ord.created_at)}</span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-label-sm font-label-sm font-bold ${statusInfo[ord.status].badge}`}>
                                {statusInfo[ord.status].label}
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                                <p className="text-label-md font-label-md text-on-surface flex items-center gap-1.5">
                                    <Icon name="person" className="text-[18px] text-secondary" />
                                    {ord.buyer?.name} <span className="text-secondary font-normal">• {ord.buyer?.class}</span>
                                </p>
                                <div className="space-y-0.5">
                                    {ord.items.map((it, i) => (
                                        <p key={i} className="text-body-md font-body-md text-on-surface">
                                            <span className="font-semibold text-primary">{it.quantity}x</span> {it.name}
                                        </p>
                                    ))}
                                </div>
                                <p className="text-[12px] text-secondary flex items-center gap-1">
                                    <Icon name="location_on" className="text-[16px]" />
                                    <strong className="text-on-surface">{ord.pickup_point}</strong>
                                </p>
                            </div>

                            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-highest text-center shrink-0">
                                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">KODE AMBIL PIN</span>
                                <span className="text-headline-sm font-headline-sm font-extrabold text-primary tracking-wider">{ord.pickup_code}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container-highest">
                            <div>
                                <span className="text-[11px] text-secondary">Total:</span>
                                <span className="text-headline-sm font-headline-sm text-primary font-bold ml-1">{rupiah(ord.total)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {ord.status === 'dipesan' && (
                                    <button
                                        disabled={busyId === ord.id}
                                        onClick={() => changeStatus(ord, 'siap_diambil')}
                                        className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-container text-label-md font-label-md shadow-sm disabled:opacity-50"
                                    >
                                        Tandai Siap Diambil
                                    </button>
                                )}
                                {ord.status === 'siap_diambil' && (
                                    <button
                                        disabled={busyId === ord.id}
                                        onClick={() => changeStatus(ord, 'selesai')}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-label-md font-label-md shadow-sm disabled:opacity-50"
                                    >
                                        Selesaikan (Sudah Diambil)
                                    </button>
                                )}
                                {(ord.status === 'dipesan' || ord.status === 'siap_diambil') && (
                                    <button
                                        disabled={busyId === ord.id}
                                        onClick={() => changeStatus(ord, 'dibatalkan')}
                                        className="px-3.5 py-2 rounded-xl border border-error text-error hover:bg-error-container/30 text-label-md font-label-md disabled:opacity-50"
                                    >
                                        Batalkan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}