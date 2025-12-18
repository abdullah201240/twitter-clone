import { ArrowLeft } from "lucide-react"
import { Button } from "../../components/ui/button"

export function ProfileHeaderSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-48 bg-gray-300 dark:bg-gray-700" />
            <div className="px-4 mt-16 space-y-3">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32" />
                <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
        </div>
    )
}

export function TweetSkeleton() {
    return (
        <div className="p-4 animate-pulse">
            <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                </div>
            </div>
        </div>
    )
}

export function UserListSkeleton() {
    return (
        <div className="p-4 animate-pulse flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32" />
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24" />
            </div>
        </div>
    )
}

export function ProfilePageSkeleton() {
    return (
        <div>
            <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 p-2 flex items-center gap-6">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="animate-pulse">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-1" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20" />
                </div>
            </div>
            <ProfileHeaderSkeleton />
        </div>
    )
}