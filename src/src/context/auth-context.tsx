
import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
    username: string
    name: string
    handle: string
    avatar: string
}

interface AuthContextType {
    user: User | null
    login: (username: string) => void
    signup: (name: string, username: string) => void
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    // Check for persisted user on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('twitter_clone_user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const login = (username: string) => {
        // Mock login logic
        const mockUser: User = {
            username: username,
            name: "User Name", // Ideally fetched from DB
            handle: `@${username.toLowerCase().replace(/\s+/g, '')}`,
            avatar: "https://github.com/shadcn.png"
        }
        setUser(mockUser)
        localStorage.setItem('twitter_clone_user', JSON.stringify(mockUser))
    }

    const signup = (name: string, username: string) => {
        const mockUser: User = {
            username: username,
            name: name,
            handle: `@${username.toLowerCase().replace(/\s+/g, '')}`,
            avatar: "https://github.com/shadcn.png"
        }
        setUser(mockUser)
        localStorage.setItem('twitter_clone_user', JSON.stringify(mockUser))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('twitter_clone_user')
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
