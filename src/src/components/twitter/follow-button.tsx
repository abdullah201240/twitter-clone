import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { profileAPI } from "../../lib/profile-api"
import { useAppSelector } from "../../store/hooks"

interface FollowButtonProps {
  userId: string
  initialFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

export function FollowButton({ userId, initialFollowing = false, onFollowChange }: FollowButtonProps) {
  const user = useAppSelector((state) => state.auth.user)
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)

  // Load follow status on mount
  useEffect(() => {
    if (!user || user.id === userId) return
    loadFollowStatus()
  }, [userId, user])

  const loadFollowStatus = async () => {
    if (!user || user.id === userId) return
    try {
      const status = await profileAPI.getFollowStatus(userId)
      setIsFollowing(status.isFollowing)
    } catch (error) {
      console.error('Error loading follow status:', error)
    }
  }

  const handleToggleFollow = async () => {
    if (!user || user.id === userId) return
    
    setIsLoading(true)
    try {
      const result = await profileAPI.toggleFollow(userId)
      setIsFollowing(result.isFollowing)
      if (onFollowChange) {
        onFollowChange(result.isFollowing)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show follow button for own profile
  if (!user || user.id === userId) {
    return null
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={`h-8 px-3 text-sm ${isFollowing ? 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800' : ''}`}
      onClick={handleToggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-current animate-pulse mr-1"></span>
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </span>
      ) : isFollowing ? (
        'Following'
      ) : (
        'Follow'
      )}
    </Button>
  )
}
