import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useAppDispatch } from "../store/hooks"
import { login as loginAction } from "../store/slices/authSlice"
import { useNavigate, Link } from "react-router-dom"

export function LoginPage() {
    const [username, setUsername] = useState("")
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (username.trim()) {
            dispatch(loginAction(username))
            navigate("/")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
            <div className="w-full max-w-sm p-6 space-y-8">
                <div className="flex justify-center">
                    {/* SVG Logo helper */}
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-12 w-12 fill-black dark:fill-white"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
                </div>

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Sign in to X</h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="Phone, email, or username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="h-12 text-lg"
                            autoFocus
                        />
                    </div>

                    <Button type="submit" className="w-full h-10 rounded-full font-bold text-md bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                        Next
                    </Button>

                    <Button variant="outline" type="button" className="w-full h-10 rounded-full font-bold text-md">
                        Forgot password?
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <p className="text-gray-500">Don't have an account? <Link to="/signup" className="text-blue-500 cursor-pointer hover:underline">Sign up</Link></p>
                </div>
            </div>
        </div>
    )
}
