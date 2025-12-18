import { useState, useEffect, useCallback } from "react"
import { Button } from "../components/ui/button"
import { ArrowLeft, Calendar, Link as LinkIcon, MapPin, Camera, MessageCircle, Heart } from "lucide-react"
import { useAppSelector } from "../store/hooks"
import { useNavigate, useParams } from "react-router-dom"
import { profileAPI, ProfileData } from "../lib/profile-api"
import { murmurAPI, Murmur } from "../lib/murmur-api"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { FollowButton } from "../components/twitter/follow-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog"

export function ProfilePage() {
    const currentUser = useAppSelector((state) => state.auth.user)
    const navigate = useNavigate()
    const { userId } = useParams<{ userId?: string }>()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [userMurmurs, setUserMurmurs] = useState<Murmur[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editData, setEditData] = useState({
        name: "",
        bio: "",
        location: "",
        website: "",
    })
    const [uploading, setUploading] = useState(false)
    
    // Determine if we're viewing our own profile
    const isOwnProfile = !userId || (currentUser && userId === currentUser.id)

    useEffect(() => {
        loadProfile()
    }, [userId, currentUser])

    const loadProfile = async () => {
        try {
            setLoading(true)
            
            // If viewing own profile and we have user data, use it
            if (isOwnProfile && currentUser) {
                // Fetch fresh profile data
                const data = await profileAPI.getProfile(currentUser.id)
                setProfile(data)
                setEditData({
                    name: data.name,
                    bio: data.bio || "",
                    location: data.location || "",
                    website: data.website || "",
                })
                
                // Load user's murmurs
                try {
                    const response = await murmurAPI.getUserMurmurs(data.id, 10)
                    setUserMurmurs(response.data)
                } catch (error) {
                    console.error('Error loading user murmurs:', error)
                }
            } 
            // If viewing another user's profile
            else if (userId) {
                const data = await profileAPI.getProfile(userId)
                setProfile(data)
                
                // Load user's murmurs
                try {
                    const response = await murmurAPI.getUserMurmurs(userId, 10)
                    setUserMurmurs(response.data)
                } catch (error) {
                    console.error('Error loading user murmurs:', error)
                }
            }
            // If viewing own profile but not logged in
            else if (!currentUser) {
                // Redirect to login only if trying to view own profile without being logged in
                if (!userId) {
                    navigate('/login')
                }
                return
            }
        } catch (error) {
            console.error('Error loading profile:', error)
            // Only redirect to login if we're trying to view our own profile and there's a serious auth issue
            // For now, we'll just show an error message instead of redirecting
            if (isOwnProfile && !currentUser) {
                navigate('/login')
            }
        } finally {
            setLoading(false)
        }
    }

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

    const handleSaveProfile = async () => {
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
    }

    if (loading) {
        return <div className="p-4 text-center">Loading profile...</div>
    }

    // If we're trying to view our own profile but aren't logged in
    if (!profile && isOwnProfile && !currentUser) {
        return <div className="p-4 text-center">Please log in to view your profile.</div>
    }

    // If we're trying to view another user's profile but it wasn't found
    if (!profile && !isOwnProfile) {
        return <div className="p-4 text-center">Profile not found.</div>
    }

    // This case should theoretically never happen due to the above checks,
    // but we add this for TypeScript to understand profile is not null
    if (!profile) {
        return <div className="p-4 text-center">Profile not available.</div>
    }

    const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
    })

    return (
        <div>
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

            {/* Cover Image */}
            <div className="relative h-48 bg-gray-200 dark:bg-gray-800 w-full group cursor-pointer">
                {profile.coverImage ? (
                    <img 
                        src={profile.coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
                )}
                {isOwnProfile && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <label className="cursor-pointer">
                            <Camera className="h-8 w-8 text-white" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                )}

                {/* Avatar */}
                <div className="absolute -bottom-16 left-4">
                    <div className="relative w-32 h-32 group/avatar">
                        <div className="w-32 h-32 rounded-full bg-black p-1 flex items-center justify-center">
                            {profile.avatar ? (
                                <img 
                                    src={profile.avatar} 
                                    alt="Profile" 
                                    className="w-full h-full rounded-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
                                    {profile.name.charAt(0)?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        {isOwnProfile && (
                            <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition flex items-center justify-center cursor-pointer">
                                <Camera className="h-6 w-6 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    disabled={uploading}
                                />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end p-4">
                {!isOwnProfile && (
                    <FollowButton userId={profile.id} />
                )}
                {isOwnProfile && (
                    <Button variant="outline" className="rounded-full font-bold" onClick={() => setIsEditOpen(true)}>
                        Edit profile
                    </Button>
                )}
            </div>

            <div className="px-4 mt-8 space-y-3">
                <div>
                    <h2 className="font-bold text-xl leading-5">{profile.name}</h2>
                    <p className="text-gray-500">@{profile.username}</p>
                </div>

                {profile.bio && (
                    <p className="text-gray-900 dark:text-gray-100">
                        {profile.bio}
                    </p>
                )}

                <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                    {profile.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{profile.location}</span>
                        </div>
                    )}
                    {profile.website && (
                        <div className="flex items-center gap-1">
                            <LinkIcon className="h-4 w-4" />
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">
                                {new URL(profile.website).hostname}
                            </a>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {joinedDate}</span>
                    </div>
                </div>

                <div className="flex gap-4 text-sm">
                    <div className="flex gap-1 hover:underline cursor-pointer">
                        <span className="font-bold text-black dark:text-white">{profile.followingCount}</span>
                        <span className="text-gray-500">Following</span>
                    </div>
                    <div className="flex gap-1 hover:underline cursor-pointer">
                        <span className="font-bold text-black dark:text-white">{profile.followersCount}</span>
                        <span className="text-gray-500">Followers</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex  mt-4">
                <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center font-bold">
                    Posts
                </div>
                <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center text-gray-500 font-medium">
                    Replies
                </div>
                <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center text-gray-500 font-medium">
                    Highlights
                </div>
                <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center text-gray-500 font-medium">
                    Media
                </div>
                <div className="flex-1 p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition text-center text-gray-500 font-medium">
                    Likes
                </div>
            </div>

            {userMurmurs.length > 0 ? (
                <div className="divide-y dark:divide-gray-800">
                    {userMurmurs.map((murmur) => (
                        <div key={murmur.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    {murmur.user.avatar ? (
                                        <img 
                                            src={murmur.user.avatar} 
                                            alt={murmur.user.name} 
                                            className="w-full h-full rounded-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                // Show the initial when image fails to load
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    const initialSpan = document.createElement('span');
                                                    initialSpan.className = 'font-bold text-gray-700 dark:text-gray-300';
                                                    initialSpan.textContent = murmur.user.name.charAt(0).toUpperCase();
                                                    parent.appendChild(initialSpan);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="font-bold text-gray-700 dark:text-gray-300">
                                            {murmur.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 dark:text-white">{murmur.user.name}</span>
                                        <span className="text-gray-500">@{murmur.user.username}</span>
                                        <span className="text-gray-500">·</span>
                                        <span className="text-gray-500">
                                            {new Date(murmur.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                        {murmur.content}
                                    </p>
                                    {murmur.mediaUrl && (
                                        <div className="mt-2 max-w-lg rounded-2xl overflow-hidden ">
                                            <img 
                                                src={murmur.mediaUrl} 
                                                alt="Attachment" 
                                                className="w-full h-auto object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="mt-3 flex gap-4 text-gray-500">
                                        <button className="flex items-center gap-1 hover:text-sky-500 transition">
                                            <MessageCircle className="w-4 h-4" />
                                            <span>{murmur.replyCount}</span>
                                        </button>
                                       
                                        <button className="flex items-center gap-1 hover:text-red-500 transition">
                                            <Heart className="w-4 h-4" />
                                            <span>{murmur.likeCount}</span>
                                        </button>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500">
                    No posts yet.
                </div>
            )}

            {/* Edit Profile Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Bio</label>
                            <Textarea
                                value={editData.bio}
                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                placeholder="Tell us about yourself"
                                className="mt-1 resize-none"
                                rows={4}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Location</label>
                            <Input
                                value={editData.location}
                                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                placeholder="Your location"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Website</label>
                            <Input
                                value={editData.website}
                                onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                                placeholder="https://example.com"
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={uploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={uploading}>
                            {uploading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}