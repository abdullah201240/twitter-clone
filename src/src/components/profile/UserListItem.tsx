import { memo } from "react"
import { UserWithFollowStatus } from "../../lib/profile-api"
import { FollowButton } from "../twitter/follow-button"

interface UserListItemProps {
    user: UserWithFollowStatus
    onNavigate: (userId: string) => void
    onFollowChange: (userId: string, isFollowing: boolean) => void
}

export const UserListItem = memo(({ 
    user, 
    onNavigate, 
    onFollowChange 
}: UserListItemProps) => (
    <div 
        className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer" 
        onClick={() => onNavigate(user.id)}
    >
        <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                    <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                        {user.name.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
            <div>
                <div className="font-bold">{user.name}</div>
                <div className="text-gray-500 text-sm">@{user.username}</div>
            </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
            <FollowButton 
                userId={user.id} 
                initialFollowing={user.isFollowed} 
                onFollowChange={(isFollowing) => onFollowChange(user.id, isFollowing)} 
            />
        </div>
    </div>
))

UserListItem.displayName = 'UserListItem'