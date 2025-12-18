import { useState, useCallback } from "react"
import { TweetCompose } from "../components/twitter/tweet-compose"
import { TwitterFeed } from "../components/twitter/feed"
import { Murmur, murmurAPI } from "../lib/murmur-api"

type FeedType = 'for-you' | 'following'

export function HomePage() {
    const [activeTab, setActiveTab] = useState<FeedType>('for-you')
    const [latestTweet, setLatestTweet] = useState<Murmur | undefined>(undefined)

    const handlePost = useCallback(async (content: string, image?: string) => {
        try {
            const newMurmur = await murmurAPI.createMurmur({
                content,
                mediaUrl: image
            });
            setLatestTweet(newMurmur);
        } catch (error) {
            console.error('Error creating murmur:', error);
        }
    }, []);


    return (
        <>
            <div className="sticky top-0 md:top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
                <div className="flex">
                    <div
                        onClick={() => setActiveTab('for-you')}
                        className="flex-1 p-4 md:p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition flex justify-center relative min-h-13.25"
                    >
                        <div className={`relative h-full flex items-center ${activeTab === 'for-you' ? 'font-bold' : 'text-gray-500 font-medium'}`}>
                            For you
                            {activeTab === 'for-you' && (
                                <div className="absolute -bottom-4.25 left-0 right-0 h-1 bg-sky-500 rounded-full" />
                            )}
                        </div>
                    </div>
                    <div
                        onClick={() => setActiveTab('following')}
                        className="flex-1 p-4 md:p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition flex justify-center relative min-h-13.25"
                    >
                        <div className={`relative h-full flex items-center ${activeTab === 'following' ? 'font-bold' : 'text-gray-500 font-medium'}`}>
                            Following
                            {activeTab === 'following' && (
                                <div className="absolute -bottom-4.25 left-0 right-0 h-1 bg-sky-500 rounded-full" />
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
