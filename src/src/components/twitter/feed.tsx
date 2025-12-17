import { useState, useEffect, useRef, useCallback } from "react"
import { Tweet } from "./tweet"
import { Loader2 } from "lucide-react"
import { murmurAPI, Murmur, TimelineResponse } from "../../lib/murmur-api"

type FeedType = 'for-you' | 'following'

interface TwitterFeedProps {
    type: FeedType
    newPost?: Murmur
}

export function TwitterFeed({ type, newPost }: TwitterFeedProps) {
    const [tweets, setTweets] = useState<Murmur[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const observerTarget = useRef(null)
    const seenIds = useRef(new Set<string>())

    // Handle new post
    useEffect(() => {
        if (newPost && !seenIds.current.has(newPost.id)) {
            setTweets(prev => [newPost, ...prev])
            seenIds.current.add(newPost.id)
        }
    }, [newPost])

    const loadMoreTweets = useCallback(async () => {
        if (isLoading || !hasMore) return

        setIsLoading(true)
        try {
            const limit = 10
            let response: TimelineResponse

            if (type === 'for-you') {
                response = await murmurAPI.getTimeline(limit, nextCursor || undefined)
            } else {
                response = await murmurAPI.getFeed(limit, nextCursor || undefined)
            }

            // Filter out duplicates
            const newTweets = response.data.filter(t => !seenIds.current.has(t.id))
            newTweets.forEach(t => seenIds.current.add(t.id))

            setTweets(prev => [...prev, ...newTweets])
            setNextCursor(response.nextCursor)
            setHasMore(response.nextCursor !== null)
        } catch (error) {
            console.error('Error loading tweets:', error)
            setHasMore(false)
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, hasMore, nextCursor, type])

    // Initial load
    useEffect(() => {
        if (tweets.length === 0 && hasMore) {
            loadMoreTweets()
        }
    }, [type]) // Reset when type changes

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !isLoading && hasMore) {
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
    }, [loadMoreTweets, isLoading, hasMore])

    return (
        <div>
            {tweets.map((murmur) => (
                <Tweet
                    key={murmur.id}
                    id={murmur.id}
                    username={murmur.user.name}
                    handle={`@${murmur.user.username}`}
                    avatar={murmur.user.avatar}
                    timestamp={new Date(murmur.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    })}
                    content={murmur.content}
                    image={murmur.mediaUrl || undefined}
                    comments={murmur.replyCount}
                    retweets={murmur.repostCount}
                    likes={murmur.likeCount}
                    views={0}
                    isVerified={false}
                    murmur={murmur}
                />
            ))}

            {/* Loading indicator / Observer target */}
            <div ref={observerTarget} className="p-4 flex justify-center items-center h-20 w-full">
                {isLoading && <Loader2 className="animate-spin text-sky-500 h-8 w-8" />}
            </div>
        </div>
    )
}
