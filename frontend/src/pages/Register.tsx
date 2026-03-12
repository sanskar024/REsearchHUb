import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        
        try {
            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setMessage('Registration Successful! Ab aap login kar sakte hain.');
            } else {
                setMessage(data.detail || 'Registration failed');
            }
        } catch (error) {
            setMessage('Backend se connect nahi ho paaya. Server check karo.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-lg rounded-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Create Account</h2>
                
                {message && (
                    <p className={`text-sm mb-4 text-center ${isSuccess ? 'text-green-600 font-bold' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}

                {!isSuccess && (
                    <form onSubmit={handleRegister}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Email</label>
                            <input 
                                type="email" 
                                className="w-full p-2 border rounded mt-1"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium">Password</label>
                            <input 
                                type="password" 
                                className="w-full p-2 border rounded mt-1"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                            Register
                        </button>
                    </form>
                )}
                
                <p className="mt-4 text-center text-sm">
                    Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;