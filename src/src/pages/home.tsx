import { useState } from "react"
import { TweetCompose } from "../components/twitter/tweet-compose"
import { TwitterFeed } from "../components/twitter/feed"
import { useAppSelector } from "../store/hooks"

type FeedType = 'for-you' | 'following'

export function HomePage() {
    const [activeTab, setActiveTab] = useState<FeedType>('for-you')
    const [latestTweet, setLatestTweet] = useState<any>(null)
    const user = useAppSelector((state) => state.auth.user)

    const handlePost = (content: string, image?: string) => {
        const newTweet = {
            id: Date.now(),
            username: user?.name || "User",
            handle: user?.handle || "@user",
            timestamp: "Just now",
            content: content,
            image: image,
            comments: 0,
            retweets: 0,
            likes: 0,
            isVerified: false
        }
        setLatestTweet(newTweet)
    }

    return (
        <>
            <div className="sticky top-0 md:top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b dark:border-gray-800">
                <div className="flex">
                    <div
                        onClick={() => setActiveTab('for-you')}
                        className="flex-1 p-4 md:p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition flex justify-center relative min-h-[53px]"
                    >
                        <div className={`relative h-full flex items-center ${activeTab === 'for-you' ? 'font-bold' : 'text-gray-500 font-medium'}`}>
                            For you
                            {activeTab === 'for-you' && (
                                <div className="absolute bottom-[-17px] left-0 right-0 h-[4px] bg-sky-500 rounded-full" />
                            )}
                        </div>
                    </div>
                    <div
                        onClick={() => setActiveTab('following')}
                        className="flex-1 p-4 md:p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition flex justify-center relative min-h-[53px]"
                    >
                        <div className={`relative h-full flex items-center ${activeTab === 'following' ? 'font-bold' : 'text-gray-500 font-medium'}`}>
                            Following
                            {activeTab === 'following' && (
                                <div className="absolute bottom-[-17px] left-0 right-0 h-[4px] bg-sky-500 rounded-full" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <TweetCompose onPost={handlePost} />

            {/* FOR YOU FEED */}
            <div className={activeTab === 'for-you' ? 'block' : 'hidden'}>
                <TwitterFeed type="for-you" newPost={latestTweet} />
            </div>

            {/* FOLLOWING FEED */}
            <div className={activeTab === 'following' ? 'block' : 'hidden'}>
                <TwitterFeed type="following" newPost={latestTweet} />
            </div>
        </>
    )
}
