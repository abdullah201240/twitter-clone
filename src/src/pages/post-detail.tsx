import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, Heart, MessageCircle, Repeat2, Share, BarChart2, Loader2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Murmur, murmurAPI, CommentData } from "../lib/murmur-api"
import { CommentDialog } from "../components/twitter/comment-dialog"
import { useAppSelector } from "../store/hooks"

interface Comment {
  id: number
  username: string
  handle: string
  content: string
  timestamp: string
  isVerified: boolean
}

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  const murmur = location.state?.murmur as Murmur | undefined

  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(murmur?.likeCount || 0)
  const [isRetweeted, setIsRetweeted] = useState(false)
  const [retweetCount, setRetweetCount] = useState(murmur?.repostCount || 0)
  const [commentsList, setCommentsList] = useState<CommentData[]>([])
  const [commentCount, setCommentCount] = useState(murmur?.replyCount || 0)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  // Load comments and like status on mount
  useEffect(() => {
    if (postId) {
      loadComments()
      if (user) {
        loadLikeStatus()
      }
    }
  }, [postId, user])

  const loadLikeStatus = async () => {
    if (!postId || !user) return
    try {
      const status = await murmurAPI.getLikeStatus(postId)
      setIsLiked(status.isLiked)
    } catch (error) {
      console.error('Error loading like status:', error)
    }
  }

  const loadComments = async () => {
    if (!postId) return
    setIsLoadingComments(true)
    try {
      const comments = await murmurAPI.getComments(postId)
      setCommentsList(comments)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  if (!murmur) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Post not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  const handleLike = async () => {
    if (!postId || !user) return

    try {
      const result = await murmurAPI.toggleLike(postId)
      setIsLiked(result.liked)
      setLikeCount(result.likeCount)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleRetweet = () => {
    if (isRetweeted) {
      setRetweetCount(prev => prev - 1)
    } else {
      setRetweetCount(prev => prev + 1)
    }
    setIsRetweeted(!isRetweeted)
  }

  const handleComment = () => {
    setIsCommentDialogOpen(true)
  }

  const handleAddComment = async (commentContent: string) => {
    if (!postId || !user) return

    try {
      const newComment = await murmurAPI.createComment(postId, commentContent)
      setCommentsList(prev => [newComment, ...prev])
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

  const createdDate = new Date(murmur.createdAt)
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="min-h-screen border-l border-r dark:border-gray-700">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b dark:border-gray-700 p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-xl">Post</h1>
      </div>

      {/* Post Content */}
      <div className="border-b dark:border-gray-700 p-4">
        {/* Author Info */}
        <div className="flex gap-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={murmur.user.avatar || undefined} alt={murmur.user.name} />
            <AvatarFallback>{murmur.user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{murmur.user.name}</span>
              <span className="text-gray-500">@{murmur.user.username}</span>
            </div>
            <p className="text-gray-500 text-sm">Joined {new Date(murmur.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Post Text */}
        <div className="mb-4">
          <p className="text-2xl break-words whitespace-pre-wrap">{murmur.content}</p>
        </div>

        {/* Post Image */}
        {murmur.mediaUrl && (
          <div className="mt-4 mb-4 rounded-2xl overflow-hidden border dark:border-gray-700">
            <img 
              src={murmur.mediaUrl} 
              alt="Post attachment" 
              className="w-full h-auto object-contain max-h-[500px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Date */}
        <div className="text-gray-500 text-sm mb-4 border-b dark:border-gray-700 pb-4">
          {formattedDate}
        </div>

        {/* Stats */}
        <div className="flex gap-8 text-gray-500 mb-4 border-b dark:border-gray-700 pb-4">
          <div>
            <span className="font-bold text-gray-900 dark:text-white">{formatNumber(commentCount)}</span>
            <span className="ml-2">Comments</span>
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white">{formatNumber(retweetCount)}</span>
            <span className="ml-2">Reposts</span>
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white">{formatNumber(likeCount)}</span>
            <span className="ml-2">Likes</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between max-w-md mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-blue-500 flex-1"
            onClick={handleComment}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${isRetweeted ? 'text-green-500' : 'text-gray-500'} hover:text-green-500 flex-1`}
            onClick={handleRetweet}
          >
            <Repeat2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${isLiked ? 'text-pink-600' : 'text-gray-500'} hover:text-pink-600 flex-1`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 flex-1">
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-b dark:border-gray-700 p-4">
        <h2 className="font-bold text-xl mb-4">Comments</h2>
        {isLoadingComments ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin text-sky-500 h-6 w-6" />
          </div>
        ) : commentsList.length > 0 ? (
          <div className="space-y-4">
            {commentsList.map((comment) => (
              <div key={comment.id} className="flex gap-4 pb-4 border-b dark:border-gray-700 last:border-b-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.user.avatar || undefined} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{comment.user.name}</span>
                    <span className="text-gray-500">@{comment.user.username}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 text-sm">{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="mt-2 break-words whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>

      {/* Comment Dialog */}
      <CommentDialog
        open={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
        tweetUsername={murmur.user.name}
        tweetHandle={`@${murmur.user.username}`}
        tweetContent={murmur.content}
        tweetIsVerified={false}
        onAddComment={handleAddComment}
        comments={[]}
      />
    </div>
  )
}
