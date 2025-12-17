import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Search, Settings, Mail } from "lucide-react"

export function MessagesPage() {
    return (
        <div className="flex h-screen">
            <div className="flex-1 max-w-2xl border-r dark:border-gray-800">
                <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b dark:border-gray-800 p-4 flex justify-between items-center">
                    <h1 className="font-bold text-xl">Messages</h1>
                    <div className="flex gap-4">
                        <Settings className="h-5 w-5" />
                        <Mail className="h-5 w-5" />
                    </div>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            placeholder="Search Direct Messages"
                            className="w-full pl-9 bg-gray-100 dark:bg-gray-900 border-none rounded-full h-10 focus:ring-1 ring-sky-500 focus:outline-none px-4"
                        />
                    </div>
                </div>

                <div className="hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer p-4 flex gap-4 transition">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <span className="font-bold">shadcn <span className="text-gray-500 font-normal">@shadcn</span></span>
                            <span className="text-gray-500 text-sm">2h</span>
                        </div>
                        <p className="text-gray-500 truncate">Hey! Saw your project, looks great.</p>
                    </div>
                </div>
                <div className="hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer p-4 flex gap-4 transition">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="https://github.com/vercel.png" />
                        <AvatarFallback>VC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <span className="font-bold">Vercel <span className="text-gray-500 font-normal">@vercel</span></span>
                            <span className="text-gray-500 text-sm">Dec 12</span>
                        </div>
                        <p className="text-gray-500 truncate">Keep up the good work!</p>
                    </div>
                </div>
            </div>
            <div className="hidden lg:flex flex-1 items-center justify-center p-8 border-l dark:border-gray-800">
                <div className="text-center max-w-sm">
                    <h2 className="text-3xl font-bold mb-2">Select a message</h2>
                    <p className="text-gray-500">Choose from your existing conversations, start a new one, or just keep swimming.</p>
                </div>
            </div>
        </div>
    )
}
