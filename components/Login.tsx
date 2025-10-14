import React, { useState } from 'react';
import { LogoIcon } from './icons/Icons';

interface LoginProps {
    onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    onRegister: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }
        if (!isLogin) {
            if (!username.trim()) {
                setError('Please enter a username.');
                return false;
            }
            if (!/^[a-zA-Z0-9_]{3,15}$/.test(username.trim())) {
                setError('Username must be 3-15 characters and contain only letters, numbers, or underscores.');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const result = isLogin
                ? await onLogin(email, password)
                : await onRegister(username, email, password);

            if (!result.success) {
                setError(result.message || 'An unknown error occurred.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError('');
        setUsername('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center">
                <div className="flex justify-center items-center gap-3">
                    <LogoIcon className="h-10 w-10 text-primary" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SmartMoney</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                    {isLogin ? 'Welcome back! Sign in to your account.' : 'Create an account to get started.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    )}
                     <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                     <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-sm text-red-500 dark:text-red-400 text-left">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center px-4 py-3 text-base font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={toggleForm} className="ml-2 font-medium text-primary hover:underline focus:outline-none">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;