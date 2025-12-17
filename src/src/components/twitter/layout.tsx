import { Sidebar } from "./sidebar"
import { TrendingSection } from "./trending"
import { MobileNav } from "./mobile-nav"
import { Outlet } from "react-router-dom"
import { SearchBox } from "./search-box"

export function TwitterLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-40 border-b dark:border-gray-800">
        <div className="flex items-center justify-center h-14 px-4">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-black dark:fill-white">
            <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
          </svg>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-40 border-b dark:border-gray-800">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-black dark:fill-white">
                <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
              </svg>
              <h1 className="text-xl font-bold">Home</h1>
            </div>
            <div className="flex-1 max-w-md mx-8">
              <SearchBox />
            </div>
            <div className="w-8"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto flex">
        {/* Left Sidebar - Hidden on mobile */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex max-w-5xl w-full">
          {/* Feed/Outlet area */}
          <div className="flex-1 md:border-x dark:border-gray-800 min-h-screen w-full max-w-2xl pb-16 md:pb-0">
            <Outlet />
          </div>

          {/* Right sidebar - Hidden on mobile and tablet */}
          <div className="hidden xl:block w-96 p-4 border-l-0">
            <div className="sticky top-4">
              <TrendingSection />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}