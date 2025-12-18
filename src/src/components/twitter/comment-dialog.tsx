import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { useAppSelector } from "../../store/hooks"

interface Comment {
    id: number
    username: string
    handle: string
    content: string
    timestamp: string
    isVerified: boolean
    avatar?: string | null
}

interface CommentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tweetUsername: string
    tweetHandle: string
    tweetContent: string
    tweetIsVerified: boolean
    tweetAvatar?: string | null
    onAddComment: (content: string) => void
    comments: Comment[]
}

export function CommentDialog({
    open,
    onOpenChange,
    tweetUsername,
    tweetHandle,
    tweetContent,
    tweetIsVerified,
    tweetAvatar,
    onAddComment,
    comments
}: CommentDialogProps) {
    const [commentText, setCommentText] = useState("")
    const user = useAppSelector((state) => state.auth.user)

    const handleSubmit = () => {
        if (commentText.trim()) {
            onAddComment(commentText)
            setCommentText("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="sr-only">Reply to tweet</DialogTitle>
                    
                </DialogHeader>

                {/* Original Tweet */}
                <div className="flex gap-3 pb-4">
                    <div className="flex flex-col items-center">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={tweetAvatar || "https://github.com/shadcn.png"} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="w-0.5 bg-gray-300 dark:bg-gray-700 flex-1 my-1" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-1">
                            <span className="font-bold">{tweetUsername}</span>
                            {tweetIsVerified && (
                                <Badge className="px-1 py-0 bg-blue-500 text-white rounded-full text-xs">
                                    ✓
                                </Badge>
                            )}
                            <span className="text-gray-500">{tweetHandle}</span>
                        </div>
                        <p className="mt-1 text-sm">{tweetContent}</p>
                        <p className="text-gray-500 text-sm mt-2">
                            Replying to <span className="text-blue-500">{tweetHandle}</span>
                        </p>
                    </div>
                </div>

                {/* Comment Input */}
                <div className="flex gap-3 pt-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} />
                        <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <Textarea
                            placeholder="Post your reply"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="min-h-[100px] border-none focus-visible:ring-0 resize-none text-lg"
                        />
                        <div className="flex justify-between items-center mt-3">
                            
                            <Button
                                onClick={handleSubmit}
                                disabled={!commentText.trim()}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6"
                            >
                                Reply
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                {comments.length > 0 && (
                    <div className="pt-4 mt-4">
                        <h3 className="font-bold mb-4">Replies</h3>
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 mb-4 pb-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={comment.avatar || "https://github.com/shadcn.png"} />
                                    <AvatarFallback>{comment.username[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold">{comment.username}</span>
                                        {comment.isVerified && (
                                            <Badge className="px-1 py-0 bg-blue-500 text-white rounded-full text-xs">
                                                ✓
                                            </Badge>
                                        )}
                                        <span className="text-gray-500">{comment.handle}</span>
                                        <span className="text-gray-500">·</span>
                                        <span className="text-gray-500">{comment.timestamp}</span>
                                    </div>
                                    <p className="mt-1 text-sm">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
