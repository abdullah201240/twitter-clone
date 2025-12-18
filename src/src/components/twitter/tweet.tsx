import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  MessageCircle,
  Heart
} from "lucide-react"
import { Badge } from "../ui/badge"
import { CommentDialog } from "./comment-dialog"
import { useAppSelector } from "../../store/hooks"
import { Murmur, murmurAPI } from "../../lib/murmur-api"

interface Comment {
  id: number
  username: string
  handle: string
  content: string
  timestamp: string
  isVerified: boolean
}

export function Tweet({
  id,
  username = "User Name",
  handle = "@username",
  avatar,
  timestamp = "2h",
  content = "This is a sample tweet content. Twitter clones are fun to build with shadcn UI components!",
  image,
  comments = 10,
  likes = 50,
  isVerified = true,
  murmur
}: {
  id?: string
  username?: string
  handle?: string
  avatar?: string | null
  timestamp?: string
  content?: string
  image?: string
  comments?: number
  likes?: number
  views?: number
  isVerified?: boolean
  murmur?: Murmur
}) {
  const navigate = useNavigate()
  const handleTweetClick = () => {
    if (id) {
      navigate(`/post/${id}`, { state: { murmur } })
    }
  }
  const user = useAppSelector((state) => state.auth.user)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [commentsList, setCommentsList] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(comments)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)

  // Load like status on mount
  useEffect(() => {
    if (!id || !user) return
    loadLikeStatus()
  }, [id, user])

  const loadLikeStatus = async () => {
    if (!id || !user) return
    try {
      const status = await murmurAPI.getLikeStatus(id)
      setIsLiked(status.isLiked)
    } catch (error) {
      console.error('Error loading like status:', error)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!id || !user) return

    try {
      const result = await murmurAPI.toggleLike(id)
      setIsLiked(result.liked)
      setLikeCount(result.likeCount)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }


  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCommentDialogOpen(true)
  }

  const handleAddComment = async (commentContent: string) => {
    if (!id || !user) return

    try {
      const newComment = await murmurAPI.createComment(id, commentContent)
      const comment: Comment = {
        id: Date.now(),
        username: newComment.user.name,
        handle: `@${newComment.user.username}`,
        content: newComment.content,
        timestamp: "Just now",
        isVerified: false
      }
      setCommentsList(prev => [comment, ...prev])
      setCommentCount(prev => prev + 1)
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num
  }

  return (
    <>
      <div className="border-b p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer" onClick={handleTweetClick}>
        <div className="flex gap-2 md:gap-4">
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10 md:h-12 md:w-12">
              <AvatarImage src={avatar || undefined} alt={username} />
              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1">
              <span className="font-bold text-sm md:text-base">{username}</span>
              {isVerified && (
                <Badge className="px-1 py-0 bg-blue-500 text-white rounded-full text-xs">
                  ✓
                </Badge>
              )}
              <span className="text-gray-500 text-sm md:text-base">{handle}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm md:text-base">{timestamp}</span>
            </div>
            <div className="mt-1 mb-3 text-sm md:text-base break-words">
              {content}
            </div>
            {image && (
              <div className="mt-2 mb-3 rounded-2xl overflow-hidden border">
                <img src={image} alt="Tweet attachment" className="w-full h-auto object-contain max-h-[500px]" />
              </div>
            )}
            <div className="flex justify-between max-w-md -ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-500 h-9 px-2 md:px-3"
                onClick={handleComment}
              >
                <MessageCircle className="mr-1 h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm">{formatNumber(commentCount)}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`${isLiked ? 'text-pink-600' : 'text-gray-500'} hover:text-pink-600 h-9 px-2 md:px-3`}
                onClick={handleLike}
              >
                <Heart className={`mr-1 h-4 w-4 md:h-5 md:w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs md:text-sm">{formatNumber(likeCount)}</span>
              </Button>
             
             
            </div>
          </div>
        </div>
      </div>

      <CommentDialog
        open={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
        tweetUsername={username}
        tweetHandle={handle}
        tweetContent={content}
        tweetIsVerified={isVerified}
        onAddComment={handleAddComment}
        comments={commentsList}
      />
    </>
  )
}