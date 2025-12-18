import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "../components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAppSelector } from "../store/hooks"
import { useNavigate, useParams } from "react-router-dom"
import { profileAPI, ProfileData, UserWithFollowStatus } from "../lib/profile-api"
import { murmurAPI, Murmur } from "../lib/murmur-api"
import { ProfileHeader } from "../components/profile/ProfileHeader"
import { ProfileTabs } from "../components/profile/ProfileTabs"
import { EditProfileModal } from "../components/profile/EditProfileModal"
import { ProfilePageSkeleton } from "../components/profile/ProfileSkeleton"

export function ProfilePage() {
    const currentUser = useAppSelector((state) => state.auth.user)
    const navigate = useNavigate()
    const { userId } = useParams<{ userId?: string }>()
    
    // Progressive loading states
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [userMurmurs, setUserMurmurs] = useState<Murmur[]>([])
    const [murmursLoading, setMurmursLoading] = useState(true)
    const [followers, setFollowers] = useState<UserWithFollowStatus[]>([])
    const [following, setFollowing] = useState<UserWithFollowStatus[]>([])
    const [followersLoading, setFollowersLoading] = useState(false)
    const [followingLoading, setFollowingLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editData, setEditData] = useState({
        name: "",
        bio: "",
        location: "",
        website: "",
    })
    const [uploading, setUploading] = useState(false)
    const [likeStatuses, setLikeStatuses] = useState<Record<string, boolean>>({})
    
    // Memoize derived values
    const isOwnProfile = useMemo(() => 
        !userId || (currentUser && userId === currentUser.id), 
        [userId, currentUser]
    )

    const joinedDate = useMemo(() => 
        profile ? new Date(profile.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        }) : '',
        [profile]
    )

// Memoized callbacks
    const handleNavigateToProfile = useCallback((userId: string) => {
        navigate(`/profile/${userId}`)
    }, [navigate])

    const handleFollowChange = useCallback((userId: string, isFollowing: boolean) => {
        setFollowers(prev => prev.map(user => 
            user.id === userId ? { ...user, isFollowed: isFollowing } : user
        ))
        
        setFollowing(prev => prev.map(user => 
            user.id === userId ? { ...user, isFollowed: isFollowing } : user
        ))
        
        if (isOwnProfile && profile) {
            loadProfile()
        }
    }, [isOwnProfile, profile])

    const loadFollowers = useCallback(async () => {
        if (!profile || !currentUser) return;
        
        setFollowersLoading(true);
        try {
            const followersList = await profileAPI.getFollowers(profile.id);
            const updatedFollowersList = followersList.map(follower => ({
                ...follower,
                isFollowed: follower.id !== currentUser.id
            }));
            setFollowers(updatedFollowersList);
        } catch (error) {
            console.error('Error loading followers:', error);
        } finally {
            setFollowersLoading(false);
        }
    }, [profile, currentUser])

    const loadFollowing = useCallback(async () => {
        if (!profile || !currentUser) return;
        
        setFollowingLoading(true);
        try {
            const followingList = await profileAPI.getFollowing(profile.id);
            const updatedFollowingList = followingList.map(following => ({
                ...following,
                isFollowed: following.id !== currentUser.id
            }));
            setFollowing(updatedFollowingList);
        } catch (error) {
            console.error('Error loading following:', error);
        } finally {
            setFollowingLoading(false);
        }
    }, [profile, currentUser])

    const handleTabChange = useCallback((tab: 'posts' | 'followers' | 'following') => {
        setActiveTab(tab);
        
        if (tab === 'followers' && followers.length === 0) {
            loadFollowers();
        } else if (tab === 'following' && following.length === 0) {
            loadFollowing();
        }
    }, [followers.length, following.length, loadFollowers, loadFollowing])

    // PROGRESSIVE LOADING: Load profile first, then murmurs separately
    const loadProfile = useCallback(async () => {
        try {
            setProfileLoading(true)
            
            if (isOwnProfile && currentUser) {
                const data = await profileAPI.getProfile(currentUser.id)
                setProfile(data)
                setProfileLoading(false) // ✅ Show profile immediately
                
                setEditData({
                    name: data.name,
                    bio: data.bio || "",
                    location: data.location || "",
                    website: data.website || "",
                })
                
                // Load murmurs in background
                setMurmursLoading(true)
                try {
                    const response = await murmurAPI.getUserMurmurs(data.id, 10)
                    setUserMurmurs(response.data)
                } catch (error) {
                    console.error('Error loading user murmurs:', error)
                } finally {
                    setMurmursLoading(false)
                }
            } 
            else if (userId) {
                const data = await profileAPI.getProfile(userId)
                setProfile(data)
                setProfileLoading(false) // ✅ Show profile immediately
                
                // Load murmurs in background
                setMurmursLoading(true)
                try {
                    const response = await murmurAPI.getUserMurmurs(userId, 10)
                    setUserMurmurs(response.data)
                } catch (error) {
                    console.error('Error loading user murmurs:', error)
                } finally {
                    setMurmursLoading(false)
                }
            }
            else if (!currentUser) {
                if (!userId) {
                    navigate('/login')
                }
                return
            }
        } catch (error) {
            console.error('Error loading profile:', error)
            if (isOwnProfile && !currentUser) {
                navigate('/login')
            }
            setProfileLoading(false)
            setMurmursLoading(false)
        }
    }, [userId, currentUser, isOwnProfile, navigate])

    useEffect(() => {
        loadProfile()
    }, [loadProfile])

    // Optimized like status fetching
    useEffect(() => {
        const fetchLikeStatuses = async () => {
            if (!currentUser || userMurmurs.length === 0) return;
            
            const tweetIds = userMurmurs
                .filter(tweet => !(tweet.id in likeStatuses))
                .map(tweet => tweet.id);
                
            if (tweetIds.length === 0) return;
            
            try {
                const statuses = await murmurAPI.getMultipleLikeStatus(tweetIds);
                setLikeStatuses(prev => ({ ...prev, ...statuses }));
            } catch (error) {
                console.error('Error fetching like statuses:', error);
            }
        };
        
        fetchLikeStatuses();
    }, [userMurmurs, currentUser, likeStatuses]);

    const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const updated = await profileAPI.uploadAvatar(file)
            setProfile(updated)
        } catch (error) {
            console.error('Error uploading avatar:', error)
        } finally {
            setUploading(false)
        }
    }, [])

    const handleCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const updated = await profileAPI.uploadCoverImage(file)
            setProfile(updated)
        } catch (error) {
            console.error('Error uploading cover:', error)
        } finally {
            setUploading(false)
        }
    }, [])

    const handleSaveProfile = useCallback(async () => {
        try {
            setUploading(true)
            const updated = await profileAPI.updateProfile(editData)
            setProfile(updated)
            setIsEditOpen(false)
        } catch (error) {
            console.error('Error updating profile:', error)
        } finally {
            setUploading(false)
        }
    }, [editData])

    const handleMurmurDelete = useCallback((murmurId: string) => {
        setUserMurmurs(prev => prev.filter(m => m.id !== murmurId))
    }, [])

    const handleLikeChange = useCallback((murmurId: string, liked: boolean) => {
        setLikeStatuses(prev => ({ ...prev, [murmurId]: liked }))
    }, [])

    // Show skeleton while profile is loading
    if (profileLoading) {
        return <ProfilePageSkeleton />;
    }
    
    if (!profile && isOwnProfile && !currentUser) {
        return <div className="p-4 text-center">Please log in to view your profile.</div>;
    }
    
    if (!profile && !isOwnProfile) {
        return <div className="p-4 text-center">Profile not found.</div>;
    }
    
    if (!profile) {
        return <div className="p-4 text-center">Profile not available.</div>;
    }

    return (
        <div>
            {/* Header - Always visible */}
            <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 
             p-2 flex items-center gap-6">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="font-bold text-xl leading-5">{profile.name}</h1>
                    <p className="text-gray-500 text-sm">{profile.murmurCount} posts</p>
                </div>
            </div>

            <ProfileHeader 
                profile={profile}
                isOwnProfile={isOwnProfile}
                uploading={uploading}
                handleAvatarUpload={handleAvatarUpload}
                handleCoverUpload={handleCoverUpload}
                setIsEditOpen={setIsEditOpen}
                joinedDate={joinedDate}
            />

            <ProfileTabs 
                activeTab={activeTab}
                handleTabChange={handleTabChange}
                profile={profile}
                userMurmurs={userMurmurs}
                murmursLoading={murmursLoading}
                followers={followers}
                followersLoading={followersLoading}
                following={following}
                followingLoading={followingLoading}
                likeStatuses={likeStatuses}
                handleMurmurDelete={handleMurmurDelete}
                handleLikeChange={handleLikeChange}
                handleNavigateToProfile={handleNavigateToProfile}
                handleFollowChange={handleFollowChange}
            />

            <EditProfileModal 
                isEditOpen={isEditOpen}
                setIsEditOpen={setIsEditOpen}
                editData={editData}
                setEditData={setEditData}
                handleSaveProfile={handleSaveProfile}
                uploading={uploading}
            />
        </div>
    )
}