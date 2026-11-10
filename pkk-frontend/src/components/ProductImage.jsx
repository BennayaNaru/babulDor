import Icon from './Icon'

const categoryIcon = {
  'Makanan Berat': 'restaurant',
  'Minuman Segar': 'local_cafe',
  'Snack & Jajanan': 'bakery_dining',
  'Kerajinan Kreatif': 'palette',
}

export default function ProductImage({ product, iconSize = 'text-[64px]' }) {
  if (product.image_url) {
    return <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-fixed to-surface-container">
      <Icon name={categoryIcon[product.category?.name] ?? 'fastfood'} className={`${iconSize} text-primary/40`} />
    </div>
  )
}