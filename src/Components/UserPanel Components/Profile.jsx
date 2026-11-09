import { useAuth } from '../../Context/AuthContext.jsx'

/** Read-only account view from GET /me (no profile update endpoint in OpenAPI). */
function Profile() {
    const { currentUser } = useAuth()

    if (!currentUser) {
        return (
            <div className="bg-obsidian-surface px-6 sm:px-8 pb-12 sm:pb-14 shadow-lg rounded-lg" id="profile">
                <p className="text-champagne-muted pt-8">Loading profile…</p>
            </div>
        )
    }

    return (
        <div className="bg-obsidian-surface px-6 sm:px-8 pb-12 sm:pb-14 shadow-lg rounded-lg transition-all duration-500" id="profile">
            <div className="head-background bg-obsidian-elevated w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] -mx-6 sm:-mx-8 -mt-8 px-6 sm:px-8 py-6 sm:py-8 mb-6 rounded-t-lg">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-champagne mt-1">
                    <span className="text-white">Profile</span> Settings
                </h2>
                <p className="text-sm text-champagne-muted mt-2">
                    Account details from the server. Editing is not available yet.
                </p>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-champagne-muted font-semibold mb-1" htmlFor="name">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={currentUser.name ?? ''}
                            id="name"
                            readOnly
                            className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-champagne-muted tracking-tight bg-obsidian mt-1.5 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-champagne-muted font-semibold mb-1" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={currentUser.email ?? ''}
                            id="email"
                            readOnly
                            className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-champagne-muted tracking-tight bg-obsidian mt-1.5 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-champagne-muted font-semibold mb-1" htmlFor="phone">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={currentUser.phone ?? ''}
                        id="phone"
                        readOnly
                        className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-champagne-muted tracking-tight bg-obsidian mt-1.5 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-champagne-muted font-semibold mb-1" htmlFor="role">
                        Role
                    </label>
                    <input
                        type="text"
                        name="role"
                        value={currentUser.role ?? ''}
                        id="role"
                        readOnly
                        className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-champagne-muted tracking-tight bg-obsidian mt-1.5 cursor-not-allowed"
                    />
                </div>
            </div>
        </div>
    )
}

export default Profile
