import { User, Mail, Phone } from 'lucide-react'
import { useAuth } from '../../Context/AuthContext'

/** Read-only admin account view from GET /me (no profile/password endpoints in OpenAPI). */
function Configuration() {
    const { currentUser } = useAuth()

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-0 sm:px-2 lg:px-8 py-2 sm:py-4 lg:py-0">
            <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                    My <span className="text-champagne">Profile</span>
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Account details from the server. Editing is not available yet.
                </p>
            </div>

            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3 border-b border-[#333] pb-3">
                        <User className="text-champagne" size={18} />
                        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wider">
                            Personal Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-gray-400 text-xs font-bold uppercase ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-champagne-muted">
                                    <User size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={currentUser?.name ?? ''}
                                    readOnly
                                    className="bg-obsidian-elevated border border-[#333] text-champagne-muted text-sm rounded-lg block w-full pl-10 p-3 outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-gray-400 text-xs font-bold uppercase ml-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-champagne-muted">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    value={currentUser?.email ?? ''}
                                    readOnly
                                    className="bg-obsidian-elevated border border-[#333] text-champagne-muted text-sm rounded-lg block w-full pl-10 p-3 outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-gray-400 text-xs font-bold uppercase ml-1">Phone</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-champagne-muted">
                                <Phone size={16} />
                            </div>
                            <input
                                type="tel"
                                value={currentUser?.phone ?? ''}
                                readOnly
                                className="bg-obsidian-elevated border border-[#333] text-champagne-muted text-sm rounded-lg block w-full pl-10 p-3 outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Configuration
