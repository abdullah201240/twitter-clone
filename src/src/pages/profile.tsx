import { Button } from "../components/ui/button"
import { ArrowLeft, Calendar, Link as LinkIcon, MapPin } from "lucide-react"

export function ProfilePage() {
    return (
        <div>
            <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b dark:border-gray-800 p-2 flex items-center gap-6">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="font-bold text-xl leading-5">User Name</h1>
                    <p className="text-gray-500 text-sm">0 posts</p>
                </div>
            </div>

            {/* Cover Image */}
            <div className="h-48 bg-gray-200 dark:bg-gray-800 w-full relative">
                {/* Avatar */}
                <div className="absolute -bottom-16 left-4">
                    <div className="w-32 h-32 rounded-full bg-black p-1">
                        <img src="https://github.com/shadcn.png" alt="Profile" className="w-full h-full rounded-full" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end p-4">
                <Button variant="outline" className="rounded-full font-bold">Edit profile</Button>
            </div>

            <div className="px-4 mt-8 space-y-3">
                <div>
                    <h2 className="font-bold text-xl leading-5">User Name</h2>
                    <p className="text-gray-500">@username</p>
                </div>

                <p className="text-gray-900 dark:text-gray-100">
                    Building cool things with React & Tailwind.
                </p>

                <div className="flex gap-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" />
                        <a href="#" className="text-sky-500 hover:underline">github.com/shadcn</a>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined December 2024</span>
                    </div>
                </div>

                <div className="flex gap-4 text-sm">
                    <div className="flex gap-1 hover:underline cursor-pointer">
                        <span className="font-bold text-black dark:text-white">1,234</span>
                        <span className="text-gray-500">Following</span>
                    </div>
                    <div className="flex gap-1 hover:underline cursor-pointer">
                        <span className="font-bold text-black dark:text-white">5,678</span>
                        <span className="text-gray-500">Followers</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-800 mt-4">
                <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center font-bold border-b-4 border-sky-500">
                    Posts
                </div>
                <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center text-gray-500 font-medium">
                    Replies
                </div>
                <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center text-gray-500 font-medium">
                    Highlights
                </div>
                <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center text-gray-500 font-medium">
                    Media
                </div>
                <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center text-gray-500 font-medium">
                    Likes
                </div>
            </div>

            <div className="p-8 text-center text-gray-500">
                No posts yet.
            </div>

        </div>
    )
}
