import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';

const Login: React.FC = () => {
    const navigate = useNavigate();
    
    // Toggle state: true = Login dikhega, false = Signup dikhega
    const [isLogin, setIsLogin] = useState(true); 
    
    // Form fields ki states
    const [name, setName] = useState(''); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (email && password) {
            if (!isLogin) {
                // --- SIGNUP FLOW ---
                if (!name) {
                    alert("Please enter your full name for signup!");
                    return;
                }
                
                // Naye user ka data Local Storage mein save kar lo
                localStorage.setItem('userName', name);
                localStorage.setItem('userEmail', email);
                
                // Success message dikhao aur wapas Login screen par bhej do
                alert("Account created successfully! Please Sign In with your new credentials.");
                setIsLogin(true); // Login mode on
                setPassword(''); // Security ke liye password field clear kar do
            } else {
                // --- LOGIN FLOW ---
                // Token set karo taaki app ke andar entry mil jaye
                localStorage.setItem('token', 'dummy_token_123'); 
                
                // Agar koi direct login kar raha hai (bina naya account banaye), toh default name set kardo
                if (!localStorage.getItem('userName')) {
                    localStorage.setItem('userName', 'Demo User');
                    localStorage.setItem('userEmail', email);
                }
                
                // Login successful, ab Home page par bhej do
                navigate('/home'); 
            }
        }
    };

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-end pr-32">
            
            {/* 3D Spline Background (Globe) */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
            </div>

            {/* Auth Card (Glassmorphism / Dark Theme) */}
            <div className="relative z-10 w-[400px] bg-[#0a0a0a]/80 backdrop-blur-md border border-gray-800 p-10 rounded-2xl shadow-2xl transition-all duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-sm text-gray-400">
                        {isLogin ? 'Sign in to continue to ResearchHub AI' : 'Join ResearchHub AI today'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    
                    {/* Name field: Sirf Signup form me dikhega */}
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                placeholder="Deepanshu Rana"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#111111] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                        <input 
                            type="email" 
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#111111] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#111111] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors mt-4"
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                {/* Toggle Link: Login aur Signup ke beech switch karne ke liye */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            // Switch karte waqt error na aaye isliye fields reset kar do
                            setName('');
                            setPassword('');
                        }} 
                        className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>

            {/* Spline Watermark / Badge */}
            <div className="absolute bottom-6 right-6 z-10 bg-[#111111] border border-gray-800 text-gray-400 px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                Built with Spline
            </div>
        </div>
    );
};

export default Login;