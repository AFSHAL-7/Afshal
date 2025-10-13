import React from 'react';

interface ProfileProps {
    transactionsCount: number;
}

const Profile: React.FC<ProfileProps> = ({ transactionsCount }) => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                    <img
                        className="h-24 w-24 rounded-full object-cover"
                        src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                        alt="User avatar"
                    />
                    <h2 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">Alex Doe</h2>
                    <p className="text-gray-500 dark:text-gray-400">alex.doe@example.com</p>
                    <div className="mt-4 text-sm text-center">
                        <p className="font-medium text-gray-600 dark:text-gray-300">Member Since</p>
                        <p className="text-gray-500 dark:text-gray-400">January 2023</p>
                    </div>
                     <div className="mt-4 text-sm text-center">
                        <p className="font-medium text-gray-600 dark:text-gray-300">Total Transactions</p>
                        <p className="text-gray-500 dark:text-gray-400">{transactionsCount}</p>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Account Details</h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input type="text" id="name" defaultValue="Alex Doe" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" id="email" defaultValue="alex.doe@example.com" disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-200 dark:bg-gray-700/50 cursor-not-allowed sm:text-sm" />
                        </div>
                        <div className="pt-2">
                             <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                Save Changes
                            </button>
                        </div>
                    </form>

                     <hr className="my-6 border-gray-200 dark:border-gray-700"/>

                     <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Change Password</h2>
                     <form className="space-y-4">
                        <div>
                            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                            <input type="password" id="current_password" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                            <input type="password" id="new_password" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                         <div className="pt-2">
                             <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                Update Password
                            </button>
                        </div>
                     </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
