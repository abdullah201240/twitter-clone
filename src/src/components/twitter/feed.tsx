import { useState, useEffect, useRef, useCallback } from "react"
import { Tweet } from "./tweet"
import { Loader2 } from "lucide-react"

type FeedType = 'for-you' | 'following'

// Mock data generator
const generateTweets = (count: number, startIndex: number, type: FeedType) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `${type}-${startIndex + i}`,
        username: type === 'for-you' ? `User ${startIndex + i + 1}` : `Followed User ${startIndex + i + 1}`,
        handle: `@${type === 'for-you' ? 'user' : 'followed_user'}${startIndex + i + 1}`,
        timestamp: `${Math.floor(Math.random() * 24) + 1}h`,
        content: type === 'for-you'
            ? `This is a "For You" tweet #${startIndex + i + 1}. Algorithms are cool! #fyp #react`
            : `This is a "Following" tweet #${startIndex + i + 1}. From someone you follow! #following #friends`,
        comments: Math.floor(Math.random() * 50),
        retweets: Math.floor(Math.random() * 20),
        likes: Math.floor(Math.random() * 100),
        views: Math.floor(Math.random() * 50000) + 1000,
        isVerified: Math.random() > 0.7
    }))
}

interface TwitterFeedProps {
    type: FeedType
    newPost?: any
}

export function TwitterFeed({ type, newPost }: TwitterFeedProps) {
    const [tweets, setTweets] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const observerTarget = useRef(null)

    // Handle new post
    useEffect(() => {
        if (newPost) {
            setTweets(prev => [newPost, ...prev])
        }
    }, [newPost])

    const loadMoreTweets = useCallback(() => {
        if (isLoading) return

        setIsLoading(true)
        // Simulate network delay
        setTimeout(() => {
            const newTweets = generateTweets(20, tweets.length, type)
            setTweets(prev => [...prev, ...newTweets])
            setIsLoading(false)
        }, 800)
    }, [tweets.length, isLoading, type])

    // Initial load
    useEffect(() => {
        if (tweets.length === 0) {
            loadMoreTweets()
        }
    }, []) // Run once on mount

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !isLoading) {
                    loadMoreTweets()
                }
            },
            { threshold: 0.1 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current)
            }
        }
    }, [loadMoreTweets, isLoading])

    return (
        <div>
            {tweets.map((tweet) => (
                <Tweet
                    key={tweet.id}
                    {...tweet}
                />
            ))}

            {/* Loading indicator / Observer target */}
            <div ref={observerTarget} className="p-4 flex justify-center items-center h-20 w-full">
                {isLoading && <Loader2 className="animate-spin text-sky-500 h-8 w-8" />}
            </div>
        </div>
    )
}
