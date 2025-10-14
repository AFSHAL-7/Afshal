import React, { useState, useEffect, useRef } from 'react';
// Fix: The 'User' type is not exported from '@supabase/supabase-js' in some versions.
// Importing from '@supabase/gotrue-js' which is the underlying auth library.
import type { User } from '@supabase/supabase-js';
import { Profile as ProfileData } from '../types';
import { SpinnerIcon, CameraIcon, DeleteIcon } from './icons/Icons';

interface ProfileProps {
    transactionsCount: number;
    user: User;
    profile: ProfileData | null;
    onUpdateProfile: (newUsername: string, profileDetails: Omit<ProfileData, 'username' | 'id'>) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ transactionsCount, user, profile, onUpdateProfile }) => {
    const [username, setUsername] = useState(profile?.username || '');
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState<string | undefined>(undefined);
    
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State for success message and its animation
    const [successMessage, setSuccessMessage] = useState('');
    const [animationClass, setAnimationClass] = useState('');
    const successTimeoutRef = useRef<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect to clear timeout on unmount
    useEffect(() => {
        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, []);


    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setFullName(profile.fullName || '');
            setBio(profile.bio || '');
            setAvatar(profile.avatar);
        } else {
            setUsername('');
            setFullName('');
            setBio('');
            setAvatar(undefined);
        }
    }, [user, profile]);

    useEffect(() => {
        const hasChanged =
            username.trim() !== (profile?.username || '') ||
            fullName !== (profile?.fullName || '') ||
            bio !== (profile?.bio || '') ||
            avatar !== profile?.avatar;
        setIsDirty(hasChanged);
    }, [username, fullName, bio, avatar, profile]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };
    
    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
        setAnimationClass('');
        if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
                clearMessages();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setAvatar(undefined);
        clearMessages();
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        
        if (!/^[a-zA-Z0-9_]{3,15}$/.test(username.trim())) {
            setError('Username must be 3-15 characters and contain only letters, numbers, or underscores.');
            return;
        }

        setIsLoading(true);
        try {
            await onUpdateProfile(username.trim(), { fullName, bio, avatar });
            setSuccessMessage('Profile updated successfully!');
            setAnimationClass('animate-fade-in-scale');

            successTimeoutRef.current = window.setTimeout(() => {
                setAnimationClass('animate-fade-out-scale');
            }, 2700); // Start fade-out before removing the message

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getInitials = (name?: string, fallback = 'SM') => {
        if (!name) return fallback;
        const parts = name.trim().split(' ').filter(p => p);
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        if (parts.length === 1 && parts[0].length > 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        if (parts.length === 1) {
            return parts[0][0].toUpperCase();
        }
        return fallback;
    };

    const initials = getInitials(fullName || profile?.username, 'SM');
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start sm:gap-6">
                        <div className="relative group flex-shrink-0">
                            {avatar ? (
                                <img
                                    className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
                                    src={avatar}
                                    alt="User avatar"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full ring-4 ring-primary/20 bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-primary dark:text-primary-200">{initials}</span>
                                </div>
                            )}

                            <div 
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                                onClick={handleAvatarClick}
                                role="button"
                                aria-label="Change profile picture"
                            >
                                <CameraIcon className="w-8 h-8 pointer-events-none" />
                                {avatar && (
                                     <button
                                        onClick={handleRemoveAvatar}
                                        className="p-2 z-10"
                                        aria-label="Remove profile picture"
                                    >
                                        <DeleteIcon className="w-7 h-7" />
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/gif"
                                className="hidden"
                            />
                        </div>
                        <div className="text-center sm:text-left mt-4 sm:mt-0">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{fullName || profile?.username}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">@{profile?.username}</p>
                            <div className="mt-4 flex items-center justify-center sm:justify-start gap-6 text-sm">
                                <div>
                                    <p className="font-medium text-gray-600 dark:text-gray-300">Member Since</p>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-600 dark:text-gray-300">Transactions</p>
                                    <p className="font-semibold text-lg text-primary">{transactionsCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <form className="p-4 sm:p-6 space-y-6" onSubmit={handleSaveChanges}>
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input 
                            type="text" 
                            id="fullName" 
                            value={fullName} 
                            onChange={(e) => {
                                setFullName(e.target.value);
                                clearMessages();
                            }}
                            className="mt-1 block w-full input-field" 
                        />
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            value={username} 
                            onChange={(e) => {
                                setUsername(e.target.value);
                                clearMessages();
                            }}
                            className="mt-1 block w-full input-field" 
                        />
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                        <textarea
                            id="bio"
                            rows={3}
                            value={bio}
                            onChange={(e) => {
                                setBio(e.target.value);
                                clearMessages();
                            }}
                            placeholder="Tell us a little about yourself"
                            className="mt-1 block w-full input-field"
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" id="email" value={user.email!} disabled readOnly className="mt-1 block w-full input-field bg-gray-200 dark:bg-gray-700/50 cursor-not-allowed" />
                    </div>
                    
                    <div className="pt-2 flex items-center gap-4">
                        <button 
                            type="submit" 
                            disabled={isLoading || !isDirty}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                        {successMessage && (
                            <p 
                                className={`text-sm text-green-500 dark:text-green-400 ${animationClass}`}
                                onAnimationEnd={() => {
                                    if (animationClass === 'animate-fade-out-scale') {
                                        setSuccessMessage('');
                                        setAnimationClass('');
                                    }
                                }}
                            >
                                {successMessage}
                            </p>
                        )}
                    </div>
                </form>
            </div>
             <style>{`.input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; background-color: #f9fafb; border-radius: 0.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .dark .input-field { border-color: #4b5563; background-color: #374151; } .input-field:focus { outline: none; --tw-ring-color: hsl(220, 80%, 55%); border-color: hsl(220, 80%, 55%); box-shadow: 0 0 0 1px hsl(220, 80%, 55%); }`}</style>
        </div>
    );
};

export default Profile;