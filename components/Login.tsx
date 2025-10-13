import React from 'react';
import { GoogleIcon, LogoIcon } from './icons/Icons';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center">
                <div className="flex justify-center items-center gap-3">
                    <LogoIcon className="h-10 w-10 text-primary" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SmartMoney</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                    Your smart financial tracker.
                    <br />
                    Gain control of your finances with ease.
                </p>
                <div>
                    <button
                        onClick={onLogin}
                        className="w-full inline-flex items-center justify-center px-4 py-3 text-base font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        Sign in with Google
                    </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    By signing in, you agree to our terms of service. This is a demo application.
                </p>
            </div>
        </div>
    );
};

export default Login;
