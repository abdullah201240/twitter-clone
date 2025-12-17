import { useState, useEffect, useRef } from "react"
import { Search, X, User, MessageCircle } from "lucide-react"
import { searchAPI, SearchResult } from "../../lib/search-api"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useDebounce } from "../../hooks/useDebounce"
import { useNavigate } from "react-router-dom"

interface SearchBoxProps {
  className?: string
}

export function SearchBox({ className }: SearchBoxProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Perform search when query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      performSearch(debouncedQuery)
    } else {
      setResults([])
    }
  }, [debouncedQuery])

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const searchResults = await searchAPI.search(searchQuery, 10)
      setResults(searchResults)
      setIsOpen(true)
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.trim().length > 0) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    
    if (result.type === 'user') {
      navigate(`/profile/${result.id}`)
    } else {
      navigate(`/post/${result.id}`)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div ref={searchRef} className={`relative ${className || ""}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search"
          className="w-full pl-10 pr-10 py-2 bg-gray-200 dark:bg-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    {result.type === 'user' ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={result.avatar || undefined} alt={result.title} />
                        <AvatarFallback>
                          {result.title.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
                        <MessageCircle className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold truncate">{result.title}</span>
                      {result.type === 'user' && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          User
                        </span>
                      )}
                      {result.type === 'murmur' && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          Post
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm truncate mt-1">
                      {result.description}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {formatDate(result.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim().length > 0 ? (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
