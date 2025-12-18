import { Calendar, Link as LinkIcon, MapPin, Camera } from "lucide-react"
import { Button } from "../../components/ui/button"
import { ProfileData } from "../../lib/profile-api"
import { FollowButton } from "../twitter/follow-button"

interface ProfileHeaderProps {
    profile: ProfileData
    isOwnProfile: boolean
    uploading: boolean
    handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    setIsEditOpen: (open: boolean) => void
    joinedDate: string
}

export function ProfileHeader({
    profile,
    isOwnProfile,
    uploading,
    handleAvatarUpload,
    handleCoverUpload,
    setIsEditOpen,
    joinedDate
}: ProfileHeaderProps) {

    return (
        <>
            {/* Cover & Avatar */}
            <div className="relative h-48 bg-gray-200 dark:bg-gray-800 w-full group cursor-pointer">
                {profile.coverImage ? (
                    <img 
                        src={profile.coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-contain"
                        loading="eager"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
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

                <div className="absolute -bottom-16 left-4">
                    <div className="relative w-32 h-32 group/avatar">
                        <div className="w-32 h-32 rounded-full bg-black p-1 flex items-center justify-center">
                            {profile.avatar ? (
                                <img 
                                    src={profile.avatar} 
                                    alt="Profile" 
                                    className="w-full h-full rounded-full object-contain"
                                    loading="eager"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'none'
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

            {/* Profile Actions */}
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

            {/* Profile Info */}
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
        </>
    )
}