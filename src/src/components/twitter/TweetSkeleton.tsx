export function TweetSkeleton() {
    return (
        <div className="border-b p-3 md:p-4 animate-pulse">
            <div className="flex gap-2 md:gap-4">
                <div className="shrink-0">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 ml-2" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8 ml-2" />
                    </div>
                    <div className="mt-2 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                    </div>
                    <div className="mt-3 h-48 bg-gray-300 dark:bg-gray-700 rounded-2xl" />
                    <div className="flex justify-between max-w-md mt-3">
                        <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
                        <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
                    </div>
                </div>
            </div>
        </div>
    )
}
