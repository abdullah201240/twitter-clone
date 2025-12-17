import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  BarChart2
} from "lucide-react"
import { Badge } from "../ui/badge"
import { CommentDialog } from "./comment-dialog"
import { useAppSelector } from "../../store/hooks"

interface Comment {
  id: number
  username: string
  handle: string
  content: string
  timestamp: string
  isVerified: boolean
}

export function Tweet({
  username = "User Name",
  handle = "@username",
  timestamp = "2h",
  content = "This is a sample tweet content. Twitter clones are fun to build with shadcn UI components!",
  image,
  comments = 10,
  retweets = 5,
  likes = 50,
  views = 1000,
  isVerified = true
}: {
  username?: string
  handle?: string
  timestamp?: string
  content?: string
  image?: string
  comments?: number
  retweets?: number
  likes?: number
  views?: number
  isVerified?: boolean
}) {
  const user = useAppSelector((state) => state.auth.user)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [isRetweeted, setIsRetweeted] = useState(false)
  const [retweetCount, setRetweetCount] = useState(retweets)
  const [commentsList, setCommentsList] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(comments)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLiked) {
      setLikeCount(prev => prev - 1)
    } else {
      setLikeCount(prev => prev + 1)
    }
    setIsLiked(!isLiked)
  }

  const handleRetweet = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isRetweeted) {
      setRetweetCount(prev => prev - 1)
    } else {
      setRetweetCount(prev => prev + 1)
    }
    setIsRetweeted(!isRetweeted)
  }

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCommentDialogOpen(true)
  }

  const handleAddComment = (commentContent: string) => {
    const newComment: Comment = {
      id: Date.now(),
      username: user?.name || "User",
      handle: user?.handle || "@user",
      content: commentContent,
      timestamp: "Just now",
      isVerified: false
    }
    setCommentsList(prev => [newComment, ...prev])
    setCommentCount(prev => prev + 1)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num
  }

  return (
    <>
      <div className="border-b p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
        <div className="flex gap-2 md:gap-4">
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10 md:h-12 md:w-12">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
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
                <img src={image} alt="Tweet attachment" className="w-full h-auto object-cover max-h-[500px]" />
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
                className={`${isRetweeted ? 'text-green-500' : 'text-gray-500'} hover:text-green-500 h-9 px-2 md:px-3`}
                onClick={handleRetweet}
              >
                <Repeat2 className="mr-1 h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm">{formatNumber(retweetCount)}</span>
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
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 h-9 px-2 md:px-3">
                <BarChart2 className="mr-1 h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm">{formatNumber(views)}</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 h-9 px-2">
                <Share className="h-4 w-4 md:h-5 md:w-5" />
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