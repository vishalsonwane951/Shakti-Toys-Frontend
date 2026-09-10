export function ProductSkeleton() {
  return (
    <div className="bg-dark-800 border border-white/8 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-dark-700" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-dark-700 rounded w-1/3" />
        <div className="h-4 bg-dark-700 rounded w-3/4" />
        <div className="h-3 bg-dark-700 rounded w-1/2" />
        <div className="flex justify-between items-center mt-3">
          <div className="h-6 bg-dark-700 rounded w-1/4" />
          <div className="h-8 bg-dark-700 rounded-xl w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}
