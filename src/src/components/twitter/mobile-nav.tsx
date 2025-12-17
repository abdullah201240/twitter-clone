import { NavLink } from "react-router-dom"
import { cn } from "../../lib/utils"
import {
    Home,
    Search,
    Bell,
    Mail,
    User
} from "lucide-react"

export function MobileNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t dark:border-gray-800 z-50">
            <div className="flex justify-around items-center h-16 px-2">
                <NavLink
                    to="/"
                    className={({ isActive }) => cn(
                        "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                        isActive ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-400"
                    )}
                >
                    {({ isActive }) => (
                        <>
                            <Home className={cn("h-7 w-7", isActive && "fill-current")} />
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/explore"
                    className={({ isActive }) => cn(
                        "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                        isActive ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-400"
                    )}
                >
                    <Search className="h-7 w-7" />
                </NavLink>

                <NavLink
                    to="/notifications"
                    className={({ isActive }) => cn(
                        "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                        isActive ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-400"
                    )}
                >
                    {({ isActive }) => (
                        <>
                            <Bell className={cn("h-7 w-7", isActive && "fill-current")} />
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/messages"
                    className={({ isActive }) => cn(
                        "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                        isActive ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-400"
                    )}
                >
                    <Mail className="h-7 w-7" />
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) => cn(
                        "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                        isActive ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-400"
                    )}
                >
                    <User className="h-7 w-7" />
                </NavLink>
            </div>
        </nav>
    )
}
