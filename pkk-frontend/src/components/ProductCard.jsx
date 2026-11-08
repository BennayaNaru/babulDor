import Icon from './Icon'
import ProductImage from './ProductImage'
import { rupiah } from '../lib/format'

export default function ProductCard({ product, isOwn, onOpen, onAdd }) {
  const available = product.stock > 0

  return (
    <div className="group bg-surface-container-lowest rounded-2xl border border-surface-container-highest overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="relative w-full aspect-square bg-surface-container overflow-hidden cursor-pointer" onClick={() => onOpen(product)}>
          <div className="w-full h-full group-hover:scale-105 transition-transform duration-300">
            <ProductImage product={product} />
          </div>

          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-white/95 backdrop-blur text-on-surface shadow-sm font-semibold">
            {product.category.name}
          </span>

          {available ? (
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Tersedia ({product.stock})
            </span>
          ) : (
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-error-container text-error flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-error" /> Habis
            </span>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center gap-1 text-[11px] text-secondary">
            <Icon name="school" className="text-[14px] text-primary" />
            <span className="truncate">{product.supplier_name}</span>
          </div>
          <h3
            className="text-label-lg font-label-lg text-on-surface group-hover:text-primary transition-colors line-clamp-1 cursor-pointer"
            onClick={() => onOpen(product)}
          >
            {product.name}
          </h3>
          <p className="text-body-sm font-body-sm text-secondary line-clamp-2 leading-relaxed">{product.description}</p>
        </div>
      </div>

      <div className="p-4 pt-0 border-t border-surface-container-highest/60 flex items-center justify-between mt-2">
        <div>
          <span className="text-[10px] text-secondary font-medium">Harga Kantin</span>
          <p className="text-currency-md font-currency-md text-primary font-bold">{rupiah(product.price)}</p>
        </div>
        <button
          onClick={() => onAdd(product)}
          disabled={!available || isOwn}
          className="px-3 py-2 rounded-xl bg-primary text-white hover:bg-primary-container disabled:bg-surface-container-highest disabled:text-secondary disabled:cursor-not-allowed text-label-md font-label-md transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Icon name="add_shopping_cart" className="text-[16px]" />
          <span>{isOwn ? 'Produkmu' : '+ Beli'}</span>
        </button>
      </div>
    </div>
  )
}