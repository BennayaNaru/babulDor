import { useEffect, useState } from 'react'
import Icon from './Icon'
import ProductImage from './ProductImage'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { rupiah } from '../lib/format'

export default function ProductDetailModal({ product, isOwn, onClose }) {
  const { add } = useCart()
  const { showToast } = useToast()
  const [qty, setQty] = useState(1)
  const canBuy = product.stock > 0 && !isOwn

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function confirmAdd() {
    add(product, qty)
    showToast(`${qty}× ${product.name} masuk keranjang`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl border border-surface-container-highest shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-56 bg-surface-container">
          <ProductImage product={product} iconSize="text-[96px]" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75">
            <Icon name="close" className="text-[18px]" />
          </button>
          <span className="absolute bottom-3 left-3 px-3 py-1 bg-surface-container-lowest/90 backdrop-blur text-primary text-label-sm font-label-sm rounded-full font-bold">
            {product.category.name}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-headline-md font-headline-md text-on-surface">{product.name}</h3>
              <span className="text-headline-sm font-headline-sm text-primary font-bold shrink-0">{rupiah(product.price)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Icon name="school" className="text-[16px] text-secondary" />
              <span className="text-body-sm font-body-sm text-secondary">
                {product.supplier_name} • {product.supplier_class}
              </span>
            </div>
          </div>

          <p className="text-body-md font-body-md text-on-surface-variant">{product.description}</p>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2 text-emerald-800 text-[12px]">
            <Icon name="verified_user" className="text-[18px] text-emerald-600 mt-0.5" />
            <div>
              <span className="font-bold">Lolos Uji Kelayakan PKK:</span>
              <span> Produk sudah diperiksa pengurus (kebersihan, kemasan, kesegaran) sebelum tayang.</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest">
            <div className="flex items-center border border-surface-container-highest rounded-xl bg-surface-container-low">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-l-xl font-bold text-lg">-</button>
              <span className="w-10 text-center font-bold text-label-md">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-r-xl font-bold text-lg">+</button>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-secondary">Total Bayar:</span>
              <p className="text-headline-sm font-headline-sm text-primary font-bold">{rupiah(product.price * qty)}</p>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-container-highest hover:bg-surface-container-low font-label-md text-secondary">
              Tutup
            </button>
            <button
              onClick={confirmAdd}
              disabled={!canBuy}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-container disabled:bg-surface-container-highest disabled:text-secondary disabled:cursor-not-allowed font-label-md shadow-sm flex items-center justify-center gap-1.5"
            >
              <Icon name="add_shopping_cart" className="text-[18px]" />
              <span>{product.stock === 0 ? 'Habis' : isOwn ? 'Produkmu' : '+ Ke Keranjang'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}