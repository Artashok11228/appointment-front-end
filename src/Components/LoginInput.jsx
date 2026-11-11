import { useState, useEffect } from "react"
import { useAuth } from "../Context/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import { RATE_LIMIT_MESSAGE } from "../shared/api"

const RATE_LIMIT_LOCK_MS = 60_000

function LoginInput() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [message, setMessage] = useState("")
    const [fieldErrors, setFieldErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [rateLimitedUntil, setRateLimitedUntil] = useState(0)
    const [now, setNow] = useState(() => Date.now())
    const { login, currentUser } = useAuth()
    const navigate = useNavigate()

    const isRateLimited = now < rateLimitedUntil

    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        if (!rateLimitedUntil) return undefined
        const tick = () => {
            const t = Date.now()
            setNow(t)
            if (t >= rateLimitedUntil) {
                setRateLimitedUntil(0)
            }
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [rateLimitedUntil])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (currentUser) {
            setMessage("You are already logged in!")
            return
        }
        if (Date.now() < rateLimitedUntil) {
            setMessage(RATE_LIMIT_MESSAGE)
            return
        }

        setSubmitting(true)
        setMessage("")
        setFieldErrors({})

        const result = await login({ email, password, rememberMe });
        setSubmitting(false)

        if (result.success) {
            setEmail("")
            setPassword("")
            return
        }

        if (result.status === 429) {
            setMessage(RATE_LIMIT_MESSAGE)
            setRateLimitedUntil(Date.now() + RATE_LIMIT_LOCK_MS)
            return
        }

        if (result.errors) {
            setFieldErrors(result.errors)
            const emailError = result.errors.email?.[0]
            const passwordError = result.errors.password?.[0]
            setMessage(emailError || passwordError || result.error)
            return
        }

        setMessage(result.error)
    }

    const submitDisabled = submitting || isRateLimited
    const cooldownSeconds = isRateLimited
        ? Math.max(1, Math.ceil((rateLimitedUntil - now) / 1000))
        : 0
    const submitLabel = submitting
        ? "Logging in..."
        : isRateLimited
            ? `Try later (${cooldownSeconds}s)`
            : "Login"

    return (
        <div className="login-box flex flex-col rounded-lg shadow-lg text-white w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto">
            <div className="head bg-obsidian-elevated p-4 sm:p-5 text-center rounded-t-2xl text-champagne text-2xl sm:text-3xl md:text-4xl font-black uppercase" style={{ textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)" }}>
                <h2>Login</h2>
            </div>
            <div className="login-form bg-obsidian-surface rounded-b-2xl pb-4 pt-2">
                <form className='p-4 sm:p-6 md:p-8' onSubmit={handleSubmit} method="post">
                    <div className="input-forms space-y-4 sm:space-y-5 md:space-y-7 mb-2">
                        <div>
                            <input type="email" name="userMail" value={email} id="userMail" placeholder="EMAIL" onChange={(e) => setEmail(e.target.value)} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champagne transition-colors focus:outline-none focus:border-champagne rounded-md" required />
                            {fieldErrors.email?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.email[0]}</p>
                            )}
                        </div>
                        <div>
                            <input type="password" name="userPassword" id="userPassword" value={password} placeholder="PASSWORD" onChange={(e) => setPassword(e.target.value)} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champagne transition-colors focus:outline-none focus:border-champagne rounded-md" required />
                            {fieldErrors.password?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.password[0]}</p>
                            )}
                        </div>
                    </div>
                    <div className="remember-forgot flex justify-start items-center mt-4 sm:mt-5 mb-10 mx-1">
                        <label className='flex items-center cursor-pointer'>
                            <input type="checkbox" name="rememberMe" id="rememberMe" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className='appearance-none w-4 h-4 rounded-full border-4 border-champagne bg-transparent checked:bg-champagne focus:outline-none focus:ring-champagne focus:ring-offset-0 cursor-pointer' />
                            <span className='text-xs sm:text-sm ml-1.5 text-[#454545] tracking-tight font-bold pb-0.5'>Remember Me</span>
                        </label>
                    </div>
                    <div className="submit-button">
                        <input type="submit" value={submitLabel} disabled={submitDisabled} className="w-full border-4 sm:border-5 border-champagne hover:border-white text-white font-black p-2 sm:p-3 px-4 sm:px-6 hover:bg-[#d28127] transition-colors cursor-pointer uppercase text-base sm:text-lg md:text-xl disabled:opacity-60 disabled:cursor-not-allowed" />
                    </div>
                    {message && <p className="mt-3 text-center text-champagne">{message}</p>}
                    <div className="no-account mt-5 sm:mt-6 md:mt-7">
                        <p className="text-center font-bold text-xs sm:text-sm md:text-base text-[#454545] tracking-tighter">Don't have an account? <Link to="/register" className='text-champagne'>Sign In</Link></p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginInput
