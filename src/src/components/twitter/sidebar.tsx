import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { NavLink } from "react-router-dom"
import { cn } from "../../lib/utils"
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  Users,
  User,
  Ellipsis,
  Feather,
  MoreHorizontal
} from "lucide-react"

import { useAuth } from "../../context/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { LogOut } from "lucide-react"

export function Sidebar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="sticky top-0 h-screen w-64 p-4 flex flex-col border-r dark:border-gray-800">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Twitter</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink to="/" className={({ isActive }) => cn("flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors", isActive && "font-bold")}>
          <Home className="h-7 w-7" />
          Home
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => cn("flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors", isActive && "font-bold")}>
          <Search className="h-7 w-7" />
          Explore
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => cn("flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors", isActive && "font-bold")}>
          <Bell className="h-7 w-7" />
          Notifications
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => cn("flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors", isActive && "font-bold")}>
          <Mail className="h-7 w-7" />
          Messages
        </NavLink>
        <NavLink to="/bookmarks" className={({ isActive }) => cn("flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors", isActive && "font-bold")}>
          <Bookmark className="h-7 w-7" />
          Bookmarks
        </NavLink>
        <NavLink to="/communities" className={({ isActive }) => cn("flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors", isActive && "font-bold")}>
          <Users className="h-7 w-7" />
          Communities
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => cn("flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors", isActive && "font-bold")}>
          <User className="h-7 w-7" />
          Profile
        </NavLink>
        <Button variant="ghost" className="w-full justify-start text-xl rounded-full px-4 py-3 h-auto">
          <MoreHorizontal className="mr-4 h-7 w-7" />
          More
        </Button>
      </nav>

      <Button className="w-full py-6 text-lg mb-4">
        <Feather className="mr-2 h-6 w-6" />
        Post
      </Button>

      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer select-none">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.handle} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-3 hidden xl:block">
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-gray-500 text-sm">{user.handle}</p>
              </div>
              <Ellipsis className="ml-auto h-5 w-5 hidden xl:block" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 font-bold">
              <LogOut className="mr-2 h-4 w-4" />
              Log out {user.handle}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}