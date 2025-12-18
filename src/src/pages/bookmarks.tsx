import { Tweet } from "../components/twitter/tweet"

export function BookmarksPage() {
    return (
        <div>
            <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 p-4">
                <h1 className="font-bold text-xl">Bookmarks</h1>
                <p className="text-gray-500 text-sm">@username</p>
            </div>

            <div>
                <Tweet
                    username="React"
                    handle="@reactjs"
                    timestamp="1d"
                    content="React 19 is now available in beta! Try it out today."
                    comments={120}
                    likes={2300}
                    isVerified={true}
                />
            </div>
        </div>
    )
}
