import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Search, Cpu, UploadCloud, FileText, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();

    const menuItems = [
        { name: "Home", path: "/home", icon: <Home size={18} /> },
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Search Papers", path: "/search", icon: <Search size={18} /> },
        { name: "AI Tools", path: "/ai-tools", icon: <Cpu size={18} /> },
        { name: "Upload PDF", path: "/upload", icon: <UploadCloud size={18} /> },
        { name: "DocSpace", path: "/docspace", icon: <FileText size={18} /> },
    ];

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
            {/* Logo Section */}
            <div className="p-6">
                <h1 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                    <span className="text-2xl">✨</span> ResearchHub AI
                </h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 mt-6">
                <ul className="space-y-2 px-4">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        isActive 
                                            ? "bg-purple-50 text-purple-700" 
                                            : "text-gray-600 hover:bg-gray-50 hover:text-purple-600"
                                    }`
                                }
                            >
                                {item.icon}
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom Section (User/Logout) */}
            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                    className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;