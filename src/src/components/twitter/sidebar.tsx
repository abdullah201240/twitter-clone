import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { NavLink, useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"
import {
  Home,
  User,
  Ellipsis,
  Feather,
} from "lucide-react"

import { useAppSelector, useAppDispatch } from "../../store/hooks"
import { logout as logoutAction } from "../../store/slices/authSlice"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { LogOut } from "lucide-react"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { TweetCompose } from "./tweet-compose"
import { murmurAPI } from "../../lib/murmur-api"

export function Sidebar() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)

  const handleLogout = async () => {
    await dispatch(logoutAction())
    navigate('/login')
  }

  const handlePost = async (content: string, image?: string) => {
    try {
      await murmurAPI.createMurmur({
        content,
        mediaUrl: image
      });
      // Close the dialog after successful post
      setIsPostDialogOpen(false);
    } catch (error) {
      console.error('Error creating murmur:', error);
    }
  };

  if (!user) return null

  return (
    <div className="hidden md:flex sticky top-0 h-screen md:w-20 lg:w-64 p-2 lg:p-4 flex-col">
      {/* Logo */}
      <div className="mb-4 flex items-center justify-center lg:justify-start">
        <div className="p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-black dark:fill-white">
            <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
          </svg>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink to="/" className={({ isActive }) => cn("flex items-center lg:gap-4 px-3 py-3 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors justify-center lg:justify-start", isActive && "font-bold")}>
          <Home className="h-7 w-7" />
          <span className="hidden lg:inline">Home</span>
        </NavLink>
        
        
       
       
        
        {user && (
          <NavLink to={`/profile`} className={({ isActive }) => cn("flex items-center lg:gap-4 px-3 py-3 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors justify-center lg:justify-start", isActive && "font-bold")}>
            <User className="h-7 w-7" />
            <span className="hidden lg:inline">Profile</span>
          </NavLink>
        )}
       
      </nav>

      {/* Post Button - Icon on tablet, full on desktop */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full py-3 lg:py-6 text-lg mb-4 justify-center">
            <Feather className="h-6 w-6 lg:mr-2" />
            <span className="hidden lg:inline">Post</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 max-w-xl">
          <TweetCompose onPost={handlePost} />
        </DialogContent>
      </Dialog>

      {/* User Profile */}
      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer select-none justify-center lg:justify-start">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || undefined} alt={user.username} />
                <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3 hidden lg:block">
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-gray-500 text-sm">@{user.username}</p>
              </div>
              <Ellipsis className="ml-auto h-5 w-5 hidden lg:block" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 font-bold">
              <LogOut className="mr-2 h-4 w-4" />
              Log out @{user?.username}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}