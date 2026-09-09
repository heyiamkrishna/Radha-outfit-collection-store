export default function HomeLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[#F8F9FC] pt-24 sm:pt-28 pb-24 px-3.5 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-10 sm:space-y-14 overflow-hidden">
      {/* 1. Hero Peek Slider Skeleton */}
      <section className="w-full max-w-[1440px] mx-auto pt-2 pb-6 sm:pb-8">
        <div className="relative w-full aspect-[2.3/1] min-h-[220px] sm:min-h-[320px] md:min-h-[380px] rounded-[28px] sm:rounded-[36px] bg-gradient-to-r from-[#E9EDF5] via-[#F4F5F9] to-[#E9EDF5] animate-pulse border border-white/80 shadow-xs flex items-center p-6 sm:p-12 overflow-hidden">
          {/* Shimmer Wave */}
          <div className="w-1/2 space-y-3 sm:space-y-4">
            <div className="h-4 w-28 rounded-full bg-white/70" />
            <div className="h-8 sm:h-12 w-3/4 rounded-2xl bg-white/80" />
            <div className="h-4 sm:h-5 w-1/2 rounded-full bg-white/60" />
            <div className="h-9 sm:h-11 w-32 rounded-full bg-white/90 pt-2" />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/30 backdrop-blur-xs rounded-l-[36px]" />
        </div>
      </section>

      {/* 2. Latest Releases Grid Skeleton */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#E8EBF2] pb-4">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-[#E2E6EF] animate-pulse" />
            <div className="h-7 w-48 rounded-xl bg-[#E2E6EF] animate-pulse" />
          </div>
          <div className="h-4 w-20 rounded-full bg-[#E2E6EF] animate-pulse" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 rounded-[28px] p-3.5 border border-white/90 shadow-xs space-y-3 animate-pulse"
            >
              <div className="aspect-[3/4] w-full rounded-2xl bg-[#E9EDF5]" />
              <div className="space-y-2 px-1">
                <div className="h-3.5 w-3/4 rounded-full bg-[#E2E6EF]" />
                <div className="flex justify-between items-center pt-1">
                  <div className="h-4 w-16 rounded-full bg-[#E2E6EF]" />
                  <div className="h-3 w-10 rounded-full bg-[#E2E6EF]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Men's & Women's Category Rails Skeleton */}
      {[...Array(2)].map((_, sectionIdx) => (
        <section key={sectionIdx} className="space-y-6 pt-4">
          <div className="flex items-end justify-between border-b border-[#E8EBF2] pb-4">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded-full bg-[#E2E6EF] animate-pulse" />
              <div className="h-7 w-44 rounded-xl bg-[#E2E6EF] animate-pulse" />
            </div>
            <div className="h-4 w-24 rounded-full bg-[#E2E6EF] animate-pulse" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {[...Array(4)].map((_, cardIdx) => (
              <div
                key={cardIdx}
                className="bg-white/80 rounded-[28px] p-3.5 border border-white/90 shadow-xs space-y-3 animate-pulse"
              >
                <div className="aspect-[3/4] w-full rounded-2xl bg-[#E9EDF5]" />
                <div className="space-y-2 px-1">
                  <div className="h-3.5 w-2/3 rounded-full bg-[#E2E6EF]" />
                  <div className="h-4 w-16 rounded-full bg-[#E2E6EF]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}