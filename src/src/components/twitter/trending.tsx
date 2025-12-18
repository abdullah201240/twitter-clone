import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Search } from "lucide-react"
import { Input } from "../ui/input"

export function TrendingSection() {
  const trends = [
    { category: "Sports", title: "#WorldCup", tweets: "50.4K" },
    { category: "Technology", title: "React", tweets: "32.1K" },
    { category: "Entertainment", title: "NewMovie", tweets: "18.2K" },
    { category: "Politics", title: "Elections", tweets: "12.5K" },
    { category: "Trending", title: "ShadCN", tweets: "8.9K" },
  ]

  const whoToFollow = [
    { name: "John Doe", handle: "@johndoe", followers: "1.2M" },
    { name: "Jane Smith", handle: "@janesmith", followers: "850K" },
    { name: "Tech News", handle: "@technews", followers: "2.1M" },
  ]

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input 
          placeholder="Search" 
          className="pl-10 rounded-full bg-gray-100 dark:bg-gray-900 border-0 focus-visible:ring-0"
        />
      </div>

      {/* Trends */}
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Trends for you</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {trends.map((trend, index) => (
            <div 
              key={index} 
              className="p-4 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors"
            >
              <p className="text-gray-500 text-sm">{trend.category} · Trending</p>
              <p className="font-bold">{trend.title}</p>
              <p className="text-gray-500 text-sm">{trend.tweets} posts</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Who to follow */}
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {whoToFollow.map((user, index) => (
            <div 
              key={index} 
              className="flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors"
            >
              <div className="flex-1">
                <p className="font-bold">{user.name}</p>
                <p className="text-gray-500">{user.handle}</p>
                <p className="text-gray-500 text-sm">{user.followers} followers</p>
              </div>
              <Button variant="outline" size="sm">
                Follow
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-gray-500 text-sm">
        <div className="flex flex-wrap gap-2">
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">Cookie Policy</span>
          <span className="hover:underline cursor-pointer">Accessibility</span>
          <span className="hover:underline cursor-pointer">Ads info</span>
          <span className="hover:underline cursor-pointer">More</span>
        </div>
        <div className="mt-2">
          © 2024 Twitter Clone
        </div>
      </div>
    </div>
  )
}