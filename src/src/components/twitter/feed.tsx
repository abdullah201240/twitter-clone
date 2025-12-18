import { useState, useEffect, useRef, useCallback, memo } from "react"
import { Tweet } from "./tweet"
import { TweetSkeleton, FeedSkeleton } from "./index"
import { murmurAPI, Murmur, TimelineResponse } from "../../lib/murmur-api"
import { useAppSelector } from "../../store/hooks"

type FeedType = 'for-you' | 'following'

interface TwitterFeedProps {
    type: FeedType
    newPost?: Murmur
}

// Memoized Tweet component to prevent unnecessary re-renders
const MemoizedTweet = memo(Tweet)

export function TwitterFeed({ type, newPost }: TwitterFeedProps) {
    const [tweets, setTweets] = useState<Murmur[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [likeStatuses, setLikeStatuses] = useState<Record<string, boolean>>({})
    const observerTarget = useRef(null)
    const seenIds = useRef(new Set<string>())
    const fetchedLikeStatuses = useRef(new Set<string>())
    const user = useAppSelector((state) => state.auth.user)
    const loadingBatchRef = useRef(false)

    // Handle new post
    useEffect(() => {
        if (newPost && !seenIds.current.has(newPost.id)) {
            setTweets(prev => [newPost, ...prev])
            seenIds.current.add(newPost.id)
        }
    }, [newPost])

    // Virtual scrolling optimization - only render visible tweets
    const [visibleTweets, setVisibleTweets] = useState<Murmur[]>([])
    const [startIndex, setStartIndex] = useState(0)
    const VISIBLE_TWEET_COUNT = 10 // Only render 10 tweets at a time

    useEffect(() => {
        const endIndex = Math.min(startIndex + VISIBLE_TWEET_COUNT, tweets.length)
        setVisibleTweets(tweets.slice(startIndex, endIndex))
    }, [tweets, startIndex])

    // Fetch like statuses for visible tweets only
    useEffect(() => {
        const fetchLikeStatuses = async () => {
            if (!user || visibleTweets.length === 0) return;

            // Get IDs of visible tweets that haven't had like status fetched yet
            const tweetIds = visibleTweets
                .filter(tweet => !fetchedLikeStatuses.current.has(tweet.id))
                .map(tweet => tweet.id);

            if (tweetIds.length === 0) return;

            try {
                const statuses = await murmurAPI.getMultipleLikeStatus(tweetIds);
                setLikeStatuses(prev => ({ ...prev, ...statuses }));
                // Mark these IDs as fetched
                tweetIds.forEach(id => fetchedLikeStatuses.current.add(id));
            } catch (error) {
                console.error('Error fetching like statuses:', error);
            }
        };

        fetchLikeStatuses();
    }, [user, visibleTweets]);

    const loadMoreTweets = useCallback(async () => {
        // Prevent multiple simultaneous requests
        if (isLoading || !hasMore || loadingBatchRef.current) return

        setIsLoading(true)
        loadingBatchRef.current = true

        try {
            // Load tweets in larger batches for better performance
            const batchSize = 10
            let allNewTweets: Murmur[] = []
            let currentCursor: string | null = nextCursor
            let hasMoreItems: boolean = hasMore

            // Load multiple batches at once to reduce request frequency
            for (let i = 0; i < 2 && hasMoreItems; i++) {
                let response: TimelineResponse

                if (type === 'for-you') {
                    response = await murmurAPI.getTimeline(batchSize, currentCursor || undefined)
                } else {
                    response = await murmurAPI.getFeed(batchSize, currentCursor || undefined)
                }

                // Filter out duplicates
                const newTweets = response.data.filter(t => !seenIds.current.has(t.id))
                newTweets.forEach(t => seenIds.current.add(t.id))

                allNewTweets = [...allNewTweets, ...newTweets]
                currentCursor = response.nextCursor
                hasMoreItems = response.nextCursor !== null

                // If we don't have enough tweets, stop batching
                if (response.data.length < batchSize) {
                    break
                }
            }

            setTweets(prev => [...prev, ...allNewTweets])
            setNextCursor(currentCursor)
            setHasMore(hasMoreItems)
        } catch (error) {
            console.error('Error loading tweets:', error)
            setHasMore(false)
        } finally {
            setIsLoading(false)
            loadingBatchRef.current = false
        }
    }, [isLoading, hasMore, nextCursor, type])

    // Initial load with smaller batch size for faster initial render
    useEffect(() => {
        if (tweets.length === 0 && hasMore && isInitialLoad) {
            // Load a smaller initial batch for faster rendering
            const loadInitialBatch = async () => {
                setIsLoading(true);
                try {
                    let response: TimelineResponse;

                    if (type === 'for-you') {
                        response = await murmurAPI.getTimeline(10); // Smaller initial batch
                    } else {
                        response = await murmurAPI.getFeed(10); // Smaller initial batch
                    }

                    // Filter out duplicates
                    const newTweets = response.data.filter(t => !seenIds.current.has(t.id));
                    newTweets.forEach(t => seenIds.current.add(t.id));

                    setTweets(newTweets);
                    setNextCursor(response.nextCursor);
                    setHasMore(response.nextCursor !== null);
                } catch (error) {
                    console.error('Error loading initial tweets:', error);
                    setHasMore(false);
                } finally {
                    setIsLoading(false);
                    setIsInitialLoad(false);
                }
            };

            loadInitialBatch();
        }
        // Clear fetched like statuses when type changes
        fetchedLikeStatuses.current.clear();
        setLikeStatuses({});
        // Reset virtual scrolling
        setStartIndex(0);
        // Reset seen IDs when type changes
        seenIds.current.clear();
    }, [type, isInitialLoad]) // Reset when type changes

    // Intersection Observer for infinite scroll
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

    const handleDelete = (deletedId: string) => {
        setTweets(prev => prev.filter(tweet => tweet.id !== deletedId));
        // Also remove from visible tweets
        setVisibleTweets(prev => prev.filter(tweet => tweet.id !== deletedId));
    };

    // Handle scroll events for virtual scrolling
    const handleScroll = useCallback(() => {
        const container = document.querySelector('.overflow-y-auto');
        if (!container) return;

        const scrollTop = container.scrollTop;

        // Calculate which tweets should be visible
        const itemHeight = 150; // Approximate height of a tweet
        const newIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5); // Buffer of 5 tweets

        setStartIndex(newIndex);
    }, []);

    // Attach scroll listener
    useEffect(() => {
        const container = document.querySelector('.overflow-y-auto');
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    return (
        <div>
            {isLoading && tweets.length === 0 ? (
                // Show feed skeleton only on initial load
                <FeedSkeleton />
            ) : (
                <>
                    {visibleTweets.map((murmur) => (
                        <MemoizedTweet
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
                            likes={murmur.likeCount}
                            views={0}
                            isVerified={false}
                            murmur={murmur}
                            onDelete={() => handleDelete(murmur.id)}
                            isLiked={likeStatuses[murmur.id] ?? false}
                            onLikeChange={(liked) => setLikeStatuses(prev => ({ ...prev, [murmur.id]: liked }))}
                        />
                    ))}
                    {/* Show additional skeletons during infinite scroll loading */}
                    {isLoading && tweets.length > 0 && (
                        <div className="divide-y dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <TweetSkeleton key={`loading-${index}`} />
                            ))}
                        </div>
                    )}
                    {/* Observer target for infinite scroll */}
                    <div ref={observerTarget} className="h-10 flex items-center justify-center">
                        {!hasMore && tweets.length > 0 && (
                            <p className="text-gray-500 text-sm py-4">You've reached the end</p>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
