import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Alert, AlertTitle, AlertDescription } from "../ui/alert"
import { useAppSelector } from "../../store/hooks"
import { murmurAPI } from "../../lib/murmur-api"
import {
  Image as ImageIcon,
  Smile,
  Calendar,
  MapPin,
  BarChart2,
  X,
  CheckCircle,
  AlertCircle,
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAppSelector((state) => state.auth.user)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isPosting, setIsPosting] = useState(false)

  const handlePost = async () => {
    if (!content.trim() && !imageFile) {
      setAlert({ type: 'error', message: 'Please enter some content or select an image' })
      return
    }

    setIsPosting(true)
    try {
      let mediaUrl: string | undefined = uploadedImageUrl || undefined

      // If there's an image file that hasn't been uploaded yet, upload it
      if (imageFile && !uploadedImageUrl) {
        try {
          const uploadResponse = await murmurAPI.uploadImage(imageFile)
          mediaUrl = uploadResponse.url
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          setAlert({ type: 'error', message: 'Failed to upload image' })
          setIsPosting(false)
          return
        }
      }

      if (onPost) {
        onPost(content, mediaUrl)
      }

      // Reset form and show success alert
      setContent("")
      setImagePreview(null)
      setImageFile(null)
      setUploadedImageUrl(null)
      setAlert({ type: 'success', message: 'Post created successfully!' })
      
      // Auto-hide success alert after 3 seconds
      setTimeout(() => setAlert(null), 3000)
    } catch (error) {
      console.error('Error posting murmur:', error)
      setAlert({ type: 'error', message: 'Failed to create post. Please try again.' })
    } finally {
      setIsPosting(false)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ type: 'error', message: 'Image size must be less than 5MB' })
        return
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setAlert({ type: 'error', message: 'Only JPEG, PNG, and WebP images are allowed' })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    setUploadedImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji)
  }

  return (
    <div className="border-b p-4">
      {alert && (
        <div className="mb-4">
          <Alert variant={alert.type === 'success' ? 'success' : 'destructive'}>
            {alert.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{alert.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className="flex">
        <div className="mr-4 flex-shrink-0">
          <Avatar>
            <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} alt={`@${user?.username}`} />
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
              className="px-4 py-2 font-bold rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePost}
              disabled={(!content.trim() && !imagePreview) || isPosting}
            >
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}