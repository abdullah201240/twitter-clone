import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
    username: string
    name: string
    handle: string
    avatar: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<string>) => {
            const username = action.payload
            state.user = {
                username: username,
                name: "User Name",
                handle: `@${username.toLowerCase().replace(/\s+/g, '')}`,
                avatar: "https://github.com/shadcn.png"
            }
            state.isAuthenticated = true
        },
        signup: (state, action: PayloadAction<{ name: string; username: string }>) => {
            const { name, username } = action.payload
            state.user = {
                username: username,
                name: name,
                handle: `@${username.toLowerCase().replace(/\s+/g, '')}`,
                avatar: "https://github.com/shadcn.png"
            }
            state.isAuthenticated = true
        },
        logout: (state) => {
            state.user = null
            state.isAuthenticated = false
        }
    }
})

export const { login, signup, logout } = authSlice.actions
export default authSlice.reducer
