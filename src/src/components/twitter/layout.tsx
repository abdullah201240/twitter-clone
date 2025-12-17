import { Sidebar } from "./sidebar"
import { TrendingSection } from "./trending"
import { Outlet } from "react-router-dom"

export function TwitterLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex max-w-5xl w-full">
          {/* Feed/Outlet area */}
          <div className="flex-1 border-x dark:border-gray-800 min-h-screen w-full max-w-2xl">
            <Outlet />
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:block w-96 p-4 border-l-0">
            <div className="sticky top-4">
              <TrendingSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}