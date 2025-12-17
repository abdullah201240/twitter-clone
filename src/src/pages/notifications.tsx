import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Bell, Heart } from "lucide-react"

export function NotificationsPage() {
    return (
        <div>
            <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b dark:border-gray-800">
                <div className="p-4 font-bold text-xl">Notifications</div>
                <div className="flex">
                    <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center font-bold border-b-4 border-sky-500">
                        All
                    </div>
                    <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center text-gray-500 font-medium">
                        Verified
                    </div>
                    <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center text-gray-500 font-medium">
                        Mentions
                    </div>
                </div>
            </div>

            <div>
                <div className="flex gap-4 p-4 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer">
                    <Bell className="h-8 w-8 text-sky-500 fill-sky-500" />
                    <div>
                        <div className="mb-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </div>
                        <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-bold">shadcn</span> and others followed you
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 p-4 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer">
                    <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
                    <div>
                        <div className="mb-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://github.com/vercel.png" />
                                <AvatarFallback>VC</AvatarFallback>
                            </Avatar>
                        </div>
                        <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-bold">Vercel</span> liked your reply
                        </p>
                        <p className="text-gray-500 mt-1">This Twitter clone looks amazing! 🚀</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
