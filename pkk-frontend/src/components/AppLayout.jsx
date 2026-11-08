import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from './Icon'
import CartDrawer from './CartDrawer'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { homeByRole } from '../lib/roles'

const userLinks = [
  { to: '/katalog', label: 'Katalog' },
  { to: '/pesanan', label: 'Status Pesanan' },
  { to: '/ajukan', label: 'Ajukan Dagangan' },
  { to: '/dagangan-saya', label: 'Dagangan Saya' },
]

const sidebarByRole = {
  admin_pengurus: [
    { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/admin/verifikasi', label: 'Verifikasi Dagangan', icon: 'verified' },
    { to: '/admin/produk', label: 'Kelola Produk & Artikel', icon: 'inventory_2' },
    { to: '/admin/pesanan', label: 'Kelola Pesanan', icon: 'receipt_long' },
    { to: '/admin/penjualan', label: 'Penjualan Harian', icon: 'account_balance_wallet' },
    { to: '/admin/pengguna', label: 'Arsip Pengguna', icon: 'group' },
  ],
  admin_pembina: [
    { to: '/pembina', label: 'Ringkasan', icon: 'dashboard', end: true },
    { to: '/pembina/produk', label: 'Produk & Artikel', icon: 'inventory_2' },
    { to: '/pembina/penjualan', label: 'Arsip Penjualan', icon: 'account_balance_wallet' },
  ],
}

// Menu belanja untuk admin (siswa/guru sudah punya di top bar)
const shopLinks = [
  { to: '/katalog', label: 'Katalog Jajan', icon: 'storefront' },
  { to: '/pesanan', label: 'Pesanan Saya', icon: 'shopping_bag' },
]

const roleInfo = {
  admin_pengurus: { badge: 'Admin Pengurus', subtitle: 'Portal Kas & Etalase Koperasi', ctaTo: '/admin/produk' },
  admin_pembina: { badge: 'Guru Pembina', subtitle: 'Pantauan Kurikulum PKK', ctaTo: '/pembina/produk' },
}

const topClass = ({ isActive }) =>
  isActive
    ? 'text-primary font-bold border-b-2 border-primary pb-1'
    : 'text-secondary hover:text-on-surface transition-colors pb-1'

const sideClass = ({ isActive }) =>
  `w-full flex items-center gap-space-sm font-label-md rounded-xl px-space-md py-space-sm text-left transition-colors ${
    isActive ? 'bg-primary-container text-on-primary-container' : 'text-secondary hover:bg-surface-container-low'
  }`

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { count, openCart } = useCart()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()

  const isUser = user.role === 'user'
  const sidebar = sidebarByRole[user.role]
  const info = roleInfo[user.role]
  const showSearch = isUser || pathname === '/katalog'

  const initials = user.name.split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase()
  const roleLabel = isUser
    ? `${user.user_type === 'guru' ? 'Guru' : 'Siswa'} (${user.class_or_position})`
    : info.badge

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== TOP APP BAR ===== */}
      <nav className="print:hidden sticky top-0 z-40 w-full flex items-center justify-between px-gutter-md py-space-sm bg-surface-container-lowest border-b border-surface-container-highest shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(homeByRole[user.role])}>
            <img alt="Logo PKK" className="w-9 h-9 object-contain rounded-md" src="/images/logo.png" />
            <div>
              <span className="text-headline-sm font-headline-sm text-primary font-bold tracking-tight">PKK Marketplace</span>
              <span className="hidden md:inline-block ml-2 text-label-sm font-label-sm px-2 py-0.5 rounded-full bg-error-container text-primary font-bold">
                SMK BISA 2025
              </span>
            </div>
          </div>

          {isUser && (
            <div className="hidden md:flex items-center gap-5 text-label-lg font-label-lg">
              {userLinks.map((l) => (
                <NavLink key={l.to} to={l.to} className={topClass}>{l.label}</NavLink>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative hidden lg:block w-56">
              <Icon name="search" className="absolute left-3 top-2.5 text-secondary text-[18px]" />
              <input
                type="text"
                value={params.get('q') ?? ''}
                onChange={(e) => {
                  const q = e.target.value
                  navigate(q ? `/katalog?q=${encodeURIComponent(q)}` : '/katalog', { replace: true })
                }}
                placeholder="Cari risol, es teh..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low rounded-xl text-body-sm font-body-sm border border-surface-container-highest focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          )}

          <button onClick={openCart} className="relative p-2 rounded-xl text-secondary hover:bg-surface-container-low transition-colors" title="Buka Keranjang Belanja">
            <Icon name="shopping_cart" className="text-[24px]" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {count}
              </span>
            )}
          </button>
          <div className="h-8 w-[1px] bg-surface-container-highest hidden sm:block" />

          <div className="flex items-center gap-2 pl-1">
            <div className="w-9 h-9 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-label-md">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-label-md font-label-md leading-tight text-on-surface">{user.name}</span>
              <span className="text-[11px] text-secondary leading-tight">{roleLabel}</span>
            </div>
          </div>

          {isUser && (
            <button onClick={handleLogout} title="Keluar" className="p-2 rounded-xl text-error hover:bg-error-container/40 transition-colors">
              <Icon name="logout" className="text-[22px]" />
            </button>
          )}
        </div>
      </nav>

      {/* ===== BODY ===== */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto relative">
        {sidebar && (
          <aside className="print:hidden hidden md:flex flex-col justify-between w-64 p-space-md bg-surface-container-lowest border-r border-surface-container-highest shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
            <div className="space-y-4">
              <div className="px-2 py-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
                  {info.badge}
                </span>
                <h2 className="text-headline-sm font-headline-sm text-on-surface mt-1">PKK SMK Hub</h2>
                <p className="text-body-sm font-body-sm text-secondary">{info.subtitle}</p>
              </div>

              <button
                onClick={() => navigate(info.ctaTo)}
                className="w-full bg-primary-container text-on-primary-container hover:bg-primary font-label-md py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
              >
                <Icon name="add_box" className="text-[18px]" />
                <span>Tambah Produk Baru</span>
              </button>

              <nav className="space-y-1 pt-2">
                {sidebar.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={sideClass}>
                    <Icon name={item.icon} className="text-[20px]" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="pt-3 border-t border-surface-container-highest space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  Belanja di Kantin
                </span>
                {shopLinks.map((item) => (
                  <NavLink key={item.to} to={item.to} className={sideClass}>
                    <Icon name={item.icon} className="text-[20px]" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-surface-container-highest">
              <button onClick={handleLogout} className="w-full flex items-center gap-space-sm text-error hover:bg-error-container/40 font-label-md rounded-xl px-space-md py-space-sm text-left transition-colors">
                <Icon name="logout" className="text-[20px]" />
                <span>Keluar</span>
              </button>
            </div>
          </aside>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>

      <CartDrawer />
    </div>
  )
}