import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import Icon from '../../components/Icon'
import { useToast } from '../../context/ToastContext'
import { downloadFile } from '../../lib/download'
import { rupiah, todayString } from '../../lib/format'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api.get('/admin/dashboard')
      .then((res) => {
        setData(res.data.data)
        setError('')
      })
      .catch(() => setError('Gagal memuat dashboard.'))
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, 30000)
    return () => clearInterval(timer)
  }, [load])

  async function exportCsv() {
    const d = todayString()
    try {
      await downloadFile('/admin/sales/export', { date: d }, `rekap-penjualan-${d}.csv`)
      showToast('Rekap hari ini berhasil diunduh.')
    } catch {
      window.alert('Gagal mengunduh rekap.')
    }
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {error && <div className="p-3 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md">{error}</div>}
        <div className="h-32 rounded-2xl bg-surface-container animate-pulse" />
        <div className="h-64 rounded-2xl bg-surface-container animate-pulse" />
      </div>
    )
  }

  const t = data.today
  const delta =
    data.yesterday_revenue > 0 ? ((t.revenue - data.yesterday_revenue) / data.yesterday_revenue) * 100 : null
  const max = Math.max(...data.series.map((s) => s.revenue), 0)

  const kpis = [
    {
      label: 'Penjualan Hari Ini', icon: 'payments', tone: 'bg-red-100 text-primary',
      value: rupiah(t.revenue), valueCls: 'text-on-surface',
      sub:
        delta === null ? (
          <span className="text-secondary">Belum ada penjualan kemarin sebagai pembanding</span>
        ) : (
          <span className={`flex items-center gap-1 font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-error'}`}>
            <Icon name={delta >= 0 ? 'trending_up' : 'trending_down'} className="text-[14px]" />
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}% dari kemarin
          </span>
        ),
    },
    {
      label: 'Barang Masuk (Titipan)', icon: 'move_to_inbox', tone: 'bg-blue-100 text-blue-700',
      value: `${t.units_in} Pcs`, valueCls: 'text-on-surface',
      sub: <span className="text-secondary">Dari {t.suppliers_in} pemasok hari ini</span>,
    },
    {
      label: 'Barang Keluar (Terjual)', icon: 'shopping_bag', tone: 'bg-amber-100 text-amber-700',
      value: `${t.units_sold} Pcs`, valueCls: 'text-on-surface',
      sub: <span className="text-emerald-600 font-semibold">Tersisa {t.units_left} Pcs di etalase</span>,
    },
    {
      label: 'Laba Kas PKK (Rp1k/pcs)', icon: 'account_balance', tone: 'bg-emerald-100 text-emerald-800',
      value: rupiah(t.profit), valueCls: 'text-primary font-bold',
      sub: <span className="text-secondary">{t.units_sold} Pcs × Rp1.000</span>,
    },
  ]

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-label-sm font-label-sm uppercase text-primary font-bold">Ringkasan Operasional Harian</span>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Dashboard Pengurus PKK</h1>
          <p className="text-body-sm font-body-sm text-secondary">
            Data transaksi riil, arus kas koperasi, dan pemantauan titipan siswa.
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button onClick={exportCsv} className="px-3.5 py-2 rounded-xl border border-surface-container-highest bg-surface-container-lowest hover:bg-surface-container-low text-label-md font-label-md flex items-center gap-1.5 shadow-sm">
            <Icon name="download" className="text-[18px]" /> Ekspor CSV
          </button>
          <button onClick={() => window.print()} className="px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary-container text-label-md font-label-md flex items-center gap-1.5 shadow-sm">
            <Icon name="picture_as_pdf" className="text-[18px]" /> Cetak Rekap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-highest shadow-sm">
            <div className="flex items-center justify-between text-secondary">
              <span className="text-body-sm font-body-sm">{k.label}</span>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.tone}`}>
                <Icon name={k.icon} className="text-[18px]" />
              </span>
            </div>
            <p className={`text-headline-lg font-headline-lg mt-2 ${k.valueCls}`}>{k.value}</p>
            <div className="text-[11px] mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik 7 hari */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-highest shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface">Tren Omzet 7 Hari Terakhir</h2>
              <p className="text-body-sm font-body-sm text-secondary">Omzet dari pesanan berstatus Selesai</p>
            </div>
            <span className="text-label-sm font-label-sm px-2.5 py-1 bg-surface-container-low text-secondary rounded-lg">
              Hari ini: {rupiah(t.revenue)}
            </span>
          </div>
          <div className="flex items-end justify-between gap-3 pt-8 px-2">
            {data.series.map((s, i) => {
              const isToday = i === data.series.length - 1
              const pct = max > 0 ? Math.max(3, (s.revenue / max) * 100) : 3
              const day = new Date(`${s.date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short' })
              return (
                <div key={s.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-32 flex items-end">
                    <div
                      style={{ height: `${pct}%` }}
                      className={`w-full rounded-t-lg transition-all hover:bg-primary relative group ${isToday ? 'bg-primary' : 'bg-primary/30'}`}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-inverse-surface text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {rupiah(s.revenue)}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] ${isToday ? 'font-bold text-primary' : 'text-secondary'}`}>
                    {isToday ? 'Hari ini' : day}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Antrean verifikasi */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-highest shadow-sm flex flex-col justify-between print:hidden">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-headline-sm font-headline-sm text-on-surface">Antrean Verifikasi</h2>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                {data.pending?.count ?? 0} Dagangan
              </span>
            </div>
            <p className="text-body-sm font-body-sm text-secondary mb-3">
              Produk siswa berikut menunggu pemeriksaan kelayakan.
            </p>
            <div className="space-y-2.5">
              {data.pending?.items.length === 0 && (
                <p className="text-body-sm text-secondary italic">Tidak ada antrean pengajuan baru.</p>
              )}
              {data.pending?.items.map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-label-md font-label-md text-on-surface truncate">{p.name}</p>
                    <p className="text-[11px] text-secondary">Oleh: {p.supplier_class} • {p.stock} Pcs</p>
                  </div>
                  <button onClick={() => navigate('/admin/verifikasi')} className="px-2.5 py-1 bg-primary text-white text-label-sm rounded-lg hover:bg-primary-container shrink-0">
                    Uji
                  </button>
                </div>
              ))}
            </div>
            {data.active_orders > 0 && (
              <button onClick={() => navigate('/admin/pesanan')} className="mt-3 w-full p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-label-md font-label-md flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Icon name="receipt_long" className="text-[18px]" /> {data.active_orders} pesanan aktif</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            )}
          </div>
          <div className="pt-4 mt-4 border-t border-surface-container-highest">
            <button onClick={() => navigate('/admin/verifikasi')} className="w-full text-center text-primary font-label-md hover:underline flex items-center justify-center gap-1">
              <span>Buka Seluruh Antrean Kelayakan</span>
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}