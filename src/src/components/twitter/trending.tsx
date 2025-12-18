import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Search } from "lucide-react"
import { Input } from "../ui/input"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { murmurAPI } from "../../lib/murmur-api"
import { profileAPI } from "../../lib/profile-api"
import { useAppSelector } from "../../store/hooks"

export function TrendingSection() {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const [suggestedUsers, setSuggestedUsers] = useState<Array<{id: string, name: string, username: string, followersCount?: number}>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSuggestedUsers()
  }, [])

  const handleFollow = useCallback(async (userId: string) => {
    try {
      await profileAPI.toggleFollow(userId);
      // Remove the followed user from the suggestions list
      setSuggestedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, [])

  const loadSuggestedUsers = useCallback(async () => {
    try {
      // Check if we have cached suggestions that are less than 5 minutes old
      const cachedSuggestions = localStorage.getItem('suggestedUsers');
      const cacheTimestamp = localStorage.getItem('suggestedUsers_timestamp');

      if (cachedSuggestions && cacheTimestamp) {
        const ageInMinutes = (Date.now() - parseInt(cacheTimestamp)) / (1000 * 60);
        if (ageInMinutes < 5) { // Use cache if less than 5 minutes old
          const parsedSuggestions = JSON.parse(cachedSuggestions);
          setSuggestedUsers(parsedSuggestions);
          setLoading(false);
          return;
        }
      }

      // Get a smaller timeline sample to reduce data transfer
      const timeline = await murmurAPI.getTimeline(10)

      // Extract unique users from timeline
      const userMap = new Map()
      const userIdsToCheck: string[] = []

      timeline.data.forEach(murmur => {
        if (!userMap.has(murmur.user.id) && murmur.user.id !== user?.id) {
          userMap.set(murmur.user.id, {
            id: murmur.user.id,
            name: murmur.user.name,
            username: murmur.user.username,
            followersCount: 0 // We don't have followers count from murmur data
          });
          userIdsToCheck.push(murmur.user.id);
        }
      })

      // Limit the number of users to check to reduce API calls
      const limitedUserIds = userIdsToCheck.slice(0, 10);

      // Check follow status for all users in a single batch call
      let followStatusResults: Record<string, boolean> = {};

      try {
        followStatusResults = await profileAPI.getMultipleFollowStatus(limitedUserIds);
      } catch (error) {
        console.error('Error checking follow status:', error);
        // If batch call fails, fall back to individual calls
        for (let i = 0; i < Math.min(limitedUserIds.length, 5); i++) {
          try {
            const status = await profileAPI.getFollowStatus(limitedUserIds[i]);
            followStatusResults[limitedUserIds[i]] = status.isFollowing;
          } catch (error) {
            console.error('Error checking follow status:', error);
            followStatusResults[limitedUserIds[i]] = false;
          }
        }
      }

      // Filter out users that are already being followed
      const usersArray = Array.from(userMap.values()).slice(0, 10).filter((user) => {
        return !followStatusResults[user.id];
      }).slice(0, 3);

      // Cache the results
      localStorage.setItem('suggestedUsers', JSON.stringify(usersArray));
      localStorage.setItem('suggestedUsers_timestamp', Date.now().toString());

      setSuggestedUsers(usersArray);
    } catch (error) {
      console.error('Error loading suggested users:', error)
      // Fallback to dummy data if API fails
      setSuggestedUsers([
        { id: "1", name: "John Doe", username: "@johndoe", followersCount: 1200000 },
        { id: "2", name: "Jane Smith", username: "@janesmith", followersCount: 850000 },
        { id: "3", name: "Tech News", username: "@technews", followersCount: 2100000 }
      ])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

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



      {/* Suggested for you */}
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Suggested for you</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
          ) : suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                onClick={() => navigate(`/profile/${user.id}`)}>
                <div className="flex-1">
                  <p className="font-bold">{user.name}</p>
                  <p className="text-gray-500">{user.username}</p>
                  {user.followersCount !== undefined && (
                    <p className="text-gray-500 text-sm">
                      {user.followersCount >= 1000000
                        ? `${(user.followersCount / 1000000).toFixed(1)}M`
                        : user.followersCount >= 1000
                          ? `${(user.followersCount / 1000).toFixed(1)}K`
                          : user.followersCount} followers
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  handleFollow(user.id);
                }}>
                  Follow
                </Button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No suggestions available</div>
          )}
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
          © {new Date().getFullYear()} Twitter Clone
        </div>
      </div>
    </div>
  )
}
