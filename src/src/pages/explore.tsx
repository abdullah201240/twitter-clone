import { Search, MoreHorizontal } from "lucide-react"
import { Input } from "../components/ui/input"

export function ExplorePage() {
    const trends = [
        { category: "Technology • Trending", topic: "React 19", posts: "25.4K posts" },
        { category: "Sports • Trending", topic: "World Cup", posts: "120K posts" },
        { category: "Entertainment • Trending", topic: "New Movie", posts: "50K posts" },
        { category: "Politics • Trending", topic: "Election", posts: "1.2M posts" },
        { category: "Business • Trending", topic: "Stock Market", posts: "10K posts" },
    ]

    return (
        <div>
            <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 p-2">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search"
                        className="pl-9 bg-gray-100 dark:bg-gray-900 rounded-full h-11 focus-visible:ring-sky-500"
                    />
                </div>
            </div>

            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Trends for you</h2>
                <div className="space-y-4">
                    {trends.map((trend, i) => (
                        <div key={i} className="flex justify-between items-start hover:bg-gray-100 dark:hover:bg-gray-900 p-2 rounded transition cursor-pointer">
                            <div>
                                <p className="text-xs text-gray-500">{trend.category}</p>
                                <p className="font-bold text-base mt-0.5">{trend.topic}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{trend.posts}</p>
                            </div>
                            <MoreHorizontal className="h-4 w-4 text-gray-400 hover:text-sky-500" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

