import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import Icon from '../components/Icon'
import { useToast } from '../context/ToastContext'
import { formatDateTime, rupiah } from '../lib/format'
import { statusInfo } from '../lib/orderStatus'

export default function PesananPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api.get('/orders')
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

  async function cancel(order) {
    if (!window.confirm(`Apakah Anda yakin ingin membatalkan pesanan #${order.number}?`)) return
    try {
      await api.patch(`/orders/${order.id}/cancel`)
      showToast(`Pesanan #${order.number} telah dibatalkan.`)
      load()
    } catch (err) {
      window.alert(err.response?.data?.message ?? 'Gagal membatalkan pesanan.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Status & Riwayat Pesanan</h1>
          <p className="text-body-sm font-body-sm text-secondary">
            Tunjukkan kode ambil pesanan di meja kasir Kantin PKK atau Koperasi.
          </p>
        </div>
        <button onClick={() => navigate('/katalog')} className="text-primary hover:underline text-label-md font-label-md flex items-center gap-1">
          <Icon name="add_shopping_cart" className="text-[18px]" /> Beli Makanan Lain
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md">{error}</div>}

      <div className="space-y-4">
        {loading && orders.length === 0 && <div className="h-40 rounded-2xl bg-surface-container animate-pulse" />}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container-highest text-center text-secondary">
            <Icon name="receipt_long" className="text-[48px] text-surface-container-highest" />
            <p className="font-bold text-headline-sm mt-2">Belum Ada Pesanan</p>
            <p className="text-body-sm">Pesanan makanan atau karya siswa akan muncul di sini.</p>
          </div>
        )}

        {orders.map((ord) => (
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
                <div className="space-y-1">
                  {ord.items.map((it, i) => (
                    <p key={i} className="text-body-md font-body-md text-on-surface">
                      <span className="font-semibold text-primary">{it.quantity}x</span> {it.name}
                      <span className="text-secondary text-xs"> (@ {rupiah(it.price)})</span>
                    </p>
                  ))}
                </div>
                <p className="text-[12px] text-secondary flex items-center gap-1">
                  <Icon name="location_on" className="text-[16px]" />
                  Titik Ambil: <strong className="text-on-surface">{ord.pickup_point}</strong>
                </p>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-highest text-center shrink-0">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">KODE AMBIL PIN</span>
                <span className="text-headline-sm font-headline-sm font-extrabold text-primary tracking-wider">{ord.pickup_code}</span>
                <span className="text-[10px] text-secondary block mt-0.5">Tunjukkan di loket</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container-highest">
              <div>
                <span className="text-[11px] text-secondary">Total Tagihan:</span>
                <span className="text-headline-sm font-headline-sm text-primary font-bold ml-1">{rupiah(ord.total)}</span>
              </div>
              {(ord.status === 'dipesan' || ord.status === 'siap_diambil') && (
                <button onClick={() => cancel(ord)} className="px-3.5 py-1.5 rounded-xl border border-error text-error hover:bg-error-container/30 text-label-md font-label-md transition-colors">
                  Batalkan Pesanan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}