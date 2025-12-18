import { ProfileData, UserWithFollowStatus } from "../../lib/profile-api"
import { Tweet } from "../../components/twitter/tweet"
import { UserListItem } from "./UserListItem"
import { TweetSkeleton, UserListSkeleton } from "./ProfileSkeleton"

interface ProfileTabsProps {
    activeTab: 'posts' | 'followers' | 'following'
    handleTabChange: (tab: 'posts' | 'followers' | 'following') => void
    profile: ProfileData
    userMurmurs: any[]
    murmursLoading: boolean
    followers: UserWithFollowStatus[]
    followersLoading: boolean
    following: UserWithFollowStatus[]
    followingLoading: boolean
    likeStatuses: Record<string, boolean>
    handleMurmurDelete: (murmurId: string) => void
    handleLikeChange: (murmurId: string, liked: boolean) => void
    handleNavigateToProfile: (userId: string) => void
    handleFollowChange: (userId: string, isFollowing: boolean) => void
}

export function ProfileTabs({
    activeTab,
    handleTabChange,
    profile,
    userMurmurs,
    murmursLoading,
    followers,
    followersLoading,
    following,
    followingLoading,
    likeStatuses,
    handleMurmurDelete,
    handleLikeChange,
    handleNavigateToProfile,
    handleFollowChange
}: ProfileTabsProps) {

    return (
        <>
            {/* Tabs */}
            <div className="flex mt-4 border-b border-gray-200 dark:border-gray-800">
                <div 
                    className={`flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center ${activeTab === 'posts' ? 'font-bold border-b-2 border-sky-500' : 'text-gray-500 font-medium'}`}
                    onClick={() => handleTabChange('posts')}
                >
                    Posts
                </div>
                <div 
                    className={`flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center ${activeTab === 'followers' ? 'font-bold border-b-2 border-sky-500' : 'text-gray-500 font-medium'}`}
                    onClick={() => handleTabChange('followers')}
                >
                    Followers
                    <span className="ml-1 text-gray-500">{profile.followersCount}</span>
                </div>
                <div 
                    className={`flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center ${activeTab === 'following' ? 'font-bold border-b-2 border-sky-500' : 'text-gray-500 font-medium'}`}
                    onClick={() => handleTabChange('following')}
                >
                    Following
                    <span className="ml-1 text-gray-500">{profile.followingCount}</span>
                </div>
            </div>

            {/* Posts Tab */}
            {activeTab === 'posts' && (
                <div>
                    {murmursLoading ? (
                        <div>
                            {[...Array(3)].map((_, i) => (
                                <TweetSkeleton key={i} />
                            ))}
                        </div>
                    ) : userMurmurs.length > 0 ? (
                        <div className="divide-y dark:divide-gray-800">
                            {userMurmurs.map((murmur) => (
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
                                    likes={murmur.likeCount}
                                    views={0}
                                    isVerified={false}
                                    murmur={murmur}
                                    onDelete={() => handleMurmurDelete(murmur.id)}
                                    isLiked={likeStatuses[murmur.id] ?? false}
                                    onLikeChange={(liked) => handleLikeChange(murmur.id, liked)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No posts yet.
                        </div>
                    )}
                </div>
            )}

            {/* Followers Tab */}
            {activeTab === 'followers' && (
                <div>
                    {followersLoading ? (
                        <div>
                            {[...Array(5)].map((_, i) => (
                                <UserListSkeleton key={i} />
                            ))}
                        </div>
                    ) : followers.length > 0 ? (
                        <div className="divide-y dark:divide-gray-800">
                            {followers.map((user) => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    onNavigate={handleNavigateToProfile}
                                    onFollowChange={handleFollowChange}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No followers yet.
                        </div>
                    )}
                </div>
            )}

            {/* Following Tab */}
            {activeTab === 'following' && (
                <div>
                    {followingLoading ? (
                        <div>
                            {[...Array(5)].map((_, i) => (
                                <UserListSkeleton key={i} />
                            ))}
                        </div>
                    ) : following.length > 0 ? (
                        <div className="divide-y dark:divide-gray-800">
                            {following.map((user) => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    onNavigate={handleNavigateToProfile}
                                    onFollowChange={handleFollowChange}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            Not following anyone yet.
                        </div>
                    )}
                </div>
            )}
        </>
    )
}