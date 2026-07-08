const ProductCardSkeleton = () => (
  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl md:rounded-3xl overflow-hidden animate-pulse">
    {/* Image skeleton */}
    <div className="relative aspect-square bg-surface-container-low" />
    
    {/* Content skeleton */}
    <div className="p-3 md:p-4 space-y-2">
      {/* Category */}
      <div className="h-3 w-16 bg-surface-container-high rounded" />
      
      {/* Title */}
      <div className="space-y-1">
        <div className="h-4 bg-surface-container-high rounded w-full" />
        <div className="h-4 bg-surface-container-high rounded w-3/4" />
      </div>
      
      {/* Price + button */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="h-5 w-24 bg-surface-container-high rounded" />
        <div className="w-11 h-11 md:w-10 md:h-10 bg-surface-container-high rounded-lg" />
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
