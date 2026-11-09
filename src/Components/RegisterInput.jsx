import { useState, useEffect } from 'react'
import { useAuth } from '../Context/AuthContext.jsx'
import { Link, useNavigate } from 'react-router-dom'

function RegisterInput() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const { register, currentUser } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'admin') {
                navigate('/admin/dashboard')
            } else {
                navigate('/')
            }
        }
    }, [currentUser, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')
        setFieldErrors({})

        if (password !== confirmPassword) {
            setMessage('Passwords do not match')
            setFieldErrors({ password_confirmation: ['Passwords do not match'] })
            return
        }
        if (password.length < 8) {
            setMessage('Password must be at least 8 characters')
            setFieldErrors({ password: ['Password must be at least 8 characters'] })
            return
        }

        setSubmitting(true)
        const result = await register({
            name,
            email,
            password,
            password_confirmation: confirmPassword,
            rememberMe: true,
        })
        setSubmitting(false)

        if (result.success) {
            setName('')
            setEmail('')
            setPassword('')
            setConfirmPassword('')
            return
        }

        if (result.errors) {
            setFieldErrors(result.errors)
            const first =
                result.errors.name?.[0] ||
                result.errors.email?.[0] ||
                result.errors.password?.[0] ||
                result.errors.password_confirmation?.[0]
            setMessage(first || result.error)
            return
        }

        setMessage(result.error)
    }

    return (
        <div className="register-box flex flex-col rounded-md shadow-lg text-white w-full max-w-2xl mx-auto scale-88">
            <div className="head bg-obsidian-elevated p-6 text-center rounded-t-2xl text-champagne text-2xl md:text-4xl font-black" style={{ textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)" }}>
                <h2>Create Your Account</h2>
            </div>
            <div className="register-form bg-obsidian-surface rounded-b-2xl pb-3">
                <form className='px-5 md:px-9 py-6' onSubmit={handleSubmit} method="post">
                    <div className="input-forms space-y-6 mb-2">
                        <div>
                            <input type="text" placeholder="FULL NAME" value={name} id='fullname' onChange={(e) => setName(e.target.value)} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4  py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champagne transition-colors focus:outline-none focus:border-champagne rounded-md" required />
                            {fieldErrors.name?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.name[0]}</p>
                            )}
                        </div>
                        <div>
                            <input type="email" placeholder="EMAIL ADDRESS" value={email} id='email' onChange={(e) => setEmail(e.target.value)} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4  py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champagne transition-colors focus:outline-none focus:border-champagne rounded-md" required />
                            {fieldErrors.email?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.email[0]}</p>
                            )}
                        </div>
                        <div>
                            <input type="password" placeholder="PASSWORD (MIN 8)" id='password' value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4 py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champagne transition-colors focus:outline-none focus:border-champagne rounded-md" required />
                            {fieldErrors.password?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.password[0]}</p>
                            )}
                        </div>
                        <div>
                            <input type="password" placeholder="CONFIRM PASSWORD" id='confirmPassword' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4 py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champagne transition-colors focus:outline-none focus:border-champagne rounded-md" required />
                            {fieldErrors.password_confirmation?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.password_confirmation[0]}</p>
                            )}
                        </div>
                    </div>
                    <div className="submit-button mt-8">
                        <input type="submit" value={submitting ? 'Creating...' : 'Create Account'} disabled={submitting} className="w-full border-4 sm:border-6 border-champagne hover:border-white text-white font-black p-2 sm:p-3 px-4 sm:px-6 hover:bg-[#d28127] transition-colors cursor-pointer uppercase text-base sm:text-lg md:text-xl disabled:opacity-60 disabled:cursor-not-allowed" />
                    </div>
                    {message && <p className="mt-3 text-center text-champagne">{message}</p>}
                    <div className="no-account mt-4 sm:mt-5 md:mt-6">
                        <p className="text-center font-bold text-xs sm:text-sm md:text-base text-[#454545] tracking-tighter">Already have an account? <Link to="/login" className='text-champagne'>Sign In</Link></p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterInput
