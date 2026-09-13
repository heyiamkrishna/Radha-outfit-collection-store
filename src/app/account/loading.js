export default function AccountLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[#F8F9FC] py-8 sm:py-14 px-3.5 sm:px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* Customer Header Skeleton */}
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-white/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
          <div className="space-y-3 w-full max-w-sm">
            <div className="h-3 w-28 rounded-full bg-[#E2E6EF]" />
            <div className="h-8 sm:h-10 w-48 rounded-2xl bg-[#E9EDF5]" />
            <div className="h-3.5 w-36 rounded-full bg-[#E2E6EF]" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-28 rounded-full bg-[#E9EDF5]" />
            <div className="h-10 w-36 rounded-full bg-[#E2E6EF]" />
          </div>
        </div>

        {/* Orders Stream Section Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EBF2]">
            <div className="space-y-2">
              <div className="h-4 w-44 rounded-full bg-[#E2E6EF] animate-pulse" />
              <div className="h-3 w-64 rounded-full bg-[#E9EDF5] animate-pulse" />
            </div>
          </div>

          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[32px] sm:rounded-[40px] border border-white/90 p-6 sm:p-8 shadow-xs space-y-6 animate-pulse"
              >
                {/* Meta ribbon skeleton */}
                <div className="flex items-center justify-between pb-4 border-b border-[#F4F5F9]">
                  <div className="space-y-2">
                    <div className="h-2.5 w-24 rounded-full bg-[#E2E6EF]" />
                    <div className="h-4 w-32 rounded-xl bg-[#E9EDF5]" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-20 rounded-full bg-[#E2E6EF]" />
                    <div className="h-8 w-24 rounded-full bg-[#E9EDF5]" />
                  </div>
                </div>

                {/* Progress bar skeleton */}
                <div className="grid grid-cols-4 gap-3 py-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="space-y-2">
                      <div className="h-2 rounded-full bg-[#E9EDF5]" />
                      <div className="h-2.5 w-14 mx-auto rounded-full bg-[#E2E6EF]" />
                    </div>
                  ))}
                </div>

                {/* Details split skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  <div className="lg:col-span-8 space-y-3">
                    <div className="h-16 rounded-2xl bg-[#F8F9FC] border border-[#F0F2F6]" />
                    <div className="h-16 rounded-2xl bg-[#F8F9FC] border border-[#F0F2F6]" />
                  </div>
                  <div className="lg:col-span-4 h-36 rounded-2xl bg-[#F8F9FC] border border-[#F0F2F6]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}