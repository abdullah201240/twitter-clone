import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { register as registerAction } from "../store/slices/authSlice"
import { useNavigate, Link } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

export function SignupPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [month, setMonth] = useState("")
    const [day, setDay] = useState("")
    const [year, setYear] = useState("")
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { loading, error } = useAppSelector((state) => state.auth)

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!name.trim()) errors.name = "Name is required"
        if (!email.trim()) errors.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format"

        if (!username.trim()) errors.username = "Username is required"
        else if (username.length < 3) errors.username = "Username must be at least 3 characters"
        else if (username.length > 30) errors.username = "Username must not exceed 30 characters"

        if (!password.trim()) errors.password = "Password is required"
        else if (password.length < 8) errors.password = "Password must be at least 8 characters"
        else {
            const hasUpper = /[A-Z]/.test(password)
            const hasLower = /[a-z]/.test(password)
            const hasNumber = /\d/.test(password)
            const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
            const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
            if (strength < 3) {
                errors.password = "Password must contain at least 3 of: uppercase, lowercase, numbers, special characters"
            }
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        const result = await dispatch(
            registerAction({
                name: name.trim(),
                email: email.trim(),
                username: username.trim(),
                password,
            })
        )

        if (result.meta.requestStatus === 'fulfilled') {
            navigate("/")
        }
    }

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString())
    const years = Array.from({ length: 120 }, (_, i) => (2024 - i).toString())

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
            {/* Main container with overlay-like look */}
            <div className="w-full max-w-[600px] h-full md:h-auto p-4 md:p-8 rounded-2xl bg-white dark:bg-black md:shadow-xl relative flex flex-col">
                <div className="flex justify-center mb-8">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 fill-black dark:fill-white"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
                </div>

                <div className="max-w-sm mx-auto w-full flex-1 flex flex-col">
                    <h1 className="text-3xl font-bold mb-8">Create your account</h1>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-4 mb-6">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-6 flex-1">
                        <div className="space-y-4">
                            <div>
                                <Input
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value)
                                        if (validationErrors.name) setValidationErrors({ ...validationErrors, name: "" })
                                    }}
                                    className="h-14 text-lg focus:ring-1 focus:ring-sky-500 rounded-md"
                                    disabled={loading}
                                />
                                {validationErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                                )}
                            </div>
                            <div>
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (validationErrors.email) setValidationErrors({ ...validationErrors, email: "" })
                                    }}
                                    className="h-14 text-lg  focus:ring-1 focus:ring-sky-500 rounded-md"
                                    disabled={loading}
                                />
                                {validationErrors.email && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                                )}
                            </div>
                            <div>
                                <Input
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value)
                                        if (validationErrors.username) setValidationErrors({ ...validationErrors, username: "" })
                                    }}
                                    className="h-14 text-lg focus:ring-1 focus:ring-sky-500 rounded-md"
                                    disabled={loading}
                                />
                                {validationErrors.username && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
                                )}
                            </div>
                            <div>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        if (validationErrors.password) setValidationErrors({ ...validationErrors, password: "" })
                                    }}
                                    className="h-14 text-lg focus:ring-1 focus:ring-sky-500 rounded-md"
                                    disabled={loading}
                                />
                                {validationErrors.password && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <h3 className="font-bold">Date of birth</h3>
                            <p className="text-sm text-gray-500 leading-tight">
                                This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <div className="flex-[2]">
                                    <Select value={month} onValueChange={setMonth}>
                                        <SelectTrigger className="h-14" disabled={loading}>
                                            <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Select value={day} onValueChange={setDay}>
                                        <SelectTrigger className="h-14" disabled={loading}>
                                            <SelectValue placeholder="Day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Select value={year} onValueChange={setYear}>
                                        <SelectTrigger className="h-14" disabled={loading}>
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1"></div>

                        <Button
                            type="submit"
                            disabled={loading || !name || !email || !username || !password}
                            className="w-full h-12 rounded-full font-bold text-lg bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 mt-8 mb-4 disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </Button>
                    </form>

                    <div className="text-center text-sm pb-4">
                        <p className="text-gray-500">
                            Have an account already?{' '}
                            <Link to="/login" className="text-blue-500 cursor-pointer hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
