import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
    // Local Storage se user ka data uthao
    const userName = localStorage.getItem('userName') || 'Demo User';
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

    // Initials nikalne ka logic (e.g., "Deepanshu Rana" -> "DR")
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            
            <div className="flex-1 ml-64 p-8">
                {/* Dynamic Navbar Top Right */}
                <div className="flex justify-end mb-8">
                    <div className="flex items-center gap-3">
                        {/* Dynamic Avatar */}
                        <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
                            {getInitials(userName)}
                        </div>
                        <div className="text-sm">
                            <p className="font-bold text-gray-800 leading-none">{userName}</p>
                            <p className="text-xs text-gray-500">{userEmail}</p>
                        </div>
                    </div>
                </div>
                
                {/* Dynamic Page Content Load Here */}
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;