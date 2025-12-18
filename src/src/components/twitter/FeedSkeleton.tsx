import { TweetSkeleton } from "./TweetSkeleton"

export function FeedSkeleton() {
    return (
        <div className="divide-y dark:divide-gray-800">
            {Array.from({ length: 10 }).map((_, index) => (
                <TweetSkeleton key={index} />
            ))}
        </div>
    )
}