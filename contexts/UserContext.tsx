import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
// Fix: Correctly import Session and User types from supabase-js.
// The errors likely stem from an older/transitional version of the library.
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Profile as ProfileData } from '../types';

interface UserContextType {
    user: SupabaseUser | null;
    profile: ProfileData | null;
    session: Session | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    refetchProfile: () => Promise<void>;
}

const mapProfile = (data: any): ProfileData | null => {
    if (!data) return null;
    return {
        id: data.id,
        username: data.username,
        fullName: data.full_name, // Map from snake_case in DB
        bio: data.bio,
        avatar: data.avatar,
    };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const lastFetchedUserId = useRef<string | null>(null);

    const refetchProfile = useCallback(async () => {
        if (!session?.user || !supabase) return;
        
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .limit(1); // Fetch an array with at most one item

        if (error) {
            console.error("Error refetching profile:", error.message);
            throw new Error(error.message || 'Failed to reload profile data.');
        } else {
            // The result is an array. Use the first record if it exists.
            setProfile(mapProfile(profileData?.[0]));
        }
    }, [session]);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUserId = session?.user?.id ?? null;

            // Always update the session object itself, as it might contain a new token.
            setSession(session);

            // Only fetch profile if the user ID has actually changed to prevent unnecessary fetches.
            if (currentUserId !== lastFetchedUserId.current) {
                lastFetchedUserId.current = currentUserId;

                if (currentUserId) {
                    const { data: profileData, error: profileFetchError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentUserId)
                        .limit(1);
                    
                    if (profileFetchError) {
                        console.error("Error fetching profile on auth change:", profileFetchError.message);
                        setProfile(null);
                    } else {
                        setProfile(mapProfile(profileData?.[0]));
                    }
                } else {
                    setProfile(null); // User logged out
                }
            }
            
            // This is the crucial part. After the first callback from onAuthStateChange,
            // we know the initial auth state, so we can stop the main loading spinner.
            if (loading) {
                setLoading(false);
            }
        });
        
        return () => subscription.unsubscribe();
    }, [loading]);


    const login = async (email: string, password: string) => {
        if (!supabase) {
            return { success: false, message: "Database not configured. Please check environment variables." };
        }
        // Fix: Renamed `signInWithPassword` to `signIn` to match older v2 API.
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true };
    };

    const register = async (username: string, email: string, password: string) => {
        if (!supabase) {
            return { success: false, message: "Database not configured. Please check environment variables." };
        }
        // Check if username is taken first to provide immediate feedback
        const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .limit(1)
            .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 'exact one row not found'
            return { success: false, message: profileError.message };
        }
        if (existingProfile) {
            return { success: false, message: 'This username is already taken.' };
        }
        
        // Sign up the user and pass the username in the metadata.
        // The database trigger (`handle_new_user`) will handle creating the profile.
        const { error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    username: username.trim(),
                }
            }
        });

        if (error) {
            return { success: false, message: error.message };
        }
        
        // The onAuthStateChange listener will automatically update the session
        // and fetch the newly created profile. No need to insert from the client.
        return { success: true };
    };
    
    const logout = async () => {
        if (!supabase) return;
        // Fix: Correct usage of `signOut`.
        await supabase.auth.signOut();
        // onAuthStateChange will clear session and profile
    };
    
    const value = useMemo(() => ({ 
        user: session?.user ?? null,
        profile,
        session,
        loading,
        login, 
        logout, 
        register,
        refetchProfile
    }), [session, profile, loading, refetchProfile]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};