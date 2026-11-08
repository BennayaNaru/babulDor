import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Placeholder from './pages/Placeholder'
import LoginPage from './pages/LoginPage'
import KatalogPage from './pages/KatalogPage'
import PesananPage from './pages/PesananPage'
import AjukanPage from './pages/AjukanPage'
import DaganganSayaPage from './pages/DaganganSayaPage'
import DashboardPage from './pages/admin/DashboardPage'
import VerifikasiPage from './pages/admin/VerifikasiPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import PenjualanPage from './pages/admin/PenjualanPage'

const P = (title) => <Placeholder title={title} />

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* USER */}
              <Route element={<ProtectedRoute roles={['user']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/katalog" element={<KatalogPage />} />
                  <Route path="/pesanan" element={<PesananPage />} />
                  <Route path="/ajukan" element={<AjukanPage />} />
                  <Route path="/ajukan/:id" element={<AjukanPage />} />
                  <Route path="/dagangan-saya" element={<DaganganSayaPage />} />
                </Route>
              </Route>

              {/* ADMIN PENGURUS */}
              <Route element={<ProtectedRoute roles={['admin_pengurus']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/admin" element={<DashboardPage />} />
                  <Route path="/admin/verifikasi" element={<VerifikasiPage />} />
                  <Route path="/admin/produk" element={P('Kelola Produk & Artikel')} />
                  <Route path="/admin/pesanan" element={<AdminOrdersPage />} />
                  <Route path="/admin/penjualan" element={<PenjualanPage />} />
                  <Route path="/admin/pengguna" element={P('Arsip Pengguna')} />
                </Route>
              </Route>

              {/* ADMIN PEMBINA */}
              <Route element={<ProtectedRoute roles={['admin_pembina']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/pembina" element={P('Ringkasan Pembina')} />
                  <Route path="/pembina/produk" element={P('Produk & Artikel')} />
                  <Route
                    path="/pembina/penjualan"
                    element={
                      <PenjualanPage
                        readOnly
                        title="Arsip Penjualan PKK"
                        subtitle="Mode baca saja: rekap penjualan, hak pemasok, dan laba kas PKK."
                      />
                    }
                  />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}