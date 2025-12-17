import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { useAppSelector } from "../../store/hooks"
import {
  Image as ImageIcon,
  Smile,
  Calendar,
  MapPin,
  BarChart2,
  X
} from "lucide-react"

import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"

interface TweetComposeProps {
  onPost?: (content: string, image?: string) => void
}

export function TweetCompose({ onPost }: TweetComposeProps) {
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAppSelector((state) => state.auth.user)

  const handlePost = () => {
    if ((content.trim() || imagePreview) && onPost) {
      onPost(content, imagePreview || undefined)
      setContent("")
      setImagePreview(null)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji)
  }

  return (
    <div className="border-b p-4">
      <div className="flex">
        <div className="mr-4 flex-shrink-0">
          <Avatar>
            <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} alt={user?.handle} />
            <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <Textarea
            placeholder="What's happening?"
            className="min-h-[100px] resize-none border-0 p-0 text-lg focus-visible:ring-0"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {imagePreview && (
            <div className="relative mt-2 mb-4">
              <img src={imagePreview} alt="Preview" className="rounded-2xl max-h-[300px] object-contain border" />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 left-2 rounded-full h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t dark:border-gray-800">
            <div className="flex space-x-2 text-sky-500">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Button variant="ghost" size="icon" onClick={handleImageClick}>
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <BarChart2 className="h-5 w-5" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-none bg-transparent shadow-none" side="right" align="start">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon">
                <Calendar className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MapPin className="h-5 w-5" />
              </Button>
            </div>
            <Button
              className="px-4 py-2 font-bold rounded-full bg-sky-500 hover:bg-sky-600"
              onClick={handlePost}
              disabled={!content.trim() && !imagePreview}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}