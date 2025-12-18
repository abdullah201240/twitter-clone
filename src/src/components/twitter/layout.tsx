import { Sidebar } from "./sidebar"
import { TrendingSection } from "./trending"
import { MobileNav } from "./mobile-nav"
import { Outlet } from "react-router-dom"

export function TwitterLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      

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