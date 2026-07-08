import ProductCardSkeleton from './ProductCardSkeleton';

const CategorySectionSkeleton = () => (
  <div className="mb-10 animate-pulse">
    {/* Category heading */}
    <div className="flex items-center justify-between mb-5">
      <div className="h-5 w-40 bg-surface-container-high rounded border-l-4 border-primary pl-3" />
      <div className="h-7 w-16 bg-surface-container-high rounded-full" />
    </div>

    {/* Product grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {[...Array(4)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default CategorySectionSkeleton;
