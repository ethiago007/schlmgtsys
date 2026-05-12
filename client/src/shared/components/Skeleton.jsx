// Base skeleton block
export const SkeletonBlock = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

// Table row skeleton
export const SkeletonRow = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <SkeletonBlock className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Stat card skeleton
export const SkeletonStatCard = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-5">
    <SkeletonBlock className="w-14 h-14 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-8 w-16" />
    </div>
  </div>
);

// Table skeleton — full table with header and rows
export const SkeletonTable = ({ rows = 5, cols = 6 }) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 px-6 py-4 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock key={i} className="h-3 flex-1" />
      ))}
    </div>
    {/* Rows */}
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex gap-4 items-center">
          <SkeletonBlock className="w-8 h-8 rounded-full shrink-0" />
          <SkeletonBlock className="h-4 flex-1" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

// Profile skeleton
export const SkeletonProfile = () => (
  <div className="space-y-6 max-w-5xl mx-auto">
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-start gap-5">
        <SkeletonBlock className="w-16 h-16 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <SkeletonBlock className="h-6 w-48" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-4" />
            ))}
          </div>
        </div>
      </div>
    </div>
    <SkeletonTable rows={5} cols={6} />
  </div>
);

// Card skeleton
export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
    <SkeletonBlock className="h-4 w-32" />
    <SkeletonBlock className="h-8 w-20" />
  </div>
);

// Message skeleton
export const SkeletonMessage = () => (
  <div className="flex items-start gap-4 p-5">
    <SkeletonBlock className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="h-3 w-48" />
      <SkeletonBlock className="h-3 w-64" />
    </div>
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-16" />
      <SkeletonBlock className="h-5 w-14 rounded-full" />
    </div>
  </div>
);
