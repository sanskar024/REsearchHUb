import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, Search, Plus, Trash2, Calendar } from 'lucide-react';

interface Workspace {
    id: number;
    name: string;
    description: string;
    date: string;
    papers: number;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [totalPapers, setTotalPapers] = useState(0); // 🌟 NEW STATE: Database se total papers count

    // Component load hote hi data fetch karo
    useEffect(() => {
        const fetchDashboardData = async () => {
            // 1. Local storage se workspaces load karo
            let savedWorkspaces: Workspace[] = [];
            const localWs = localStorage.getItem('researchWorkspaces');
            if (localWs) {
                savedWorkspaces = JSON.parse(localWs);
            }

            // 2. 🌟 FIXED: Backend se asli papers fetch karo
            try {
                const response = await fetch('http://localhost:8000/api/papers/list');
                if (response.ok) {
                    const papersData = await response.json();
                    
                    // Top card ke liye total count set karo
                    setTotalPapers(papersData.length); 

                    // Har workspace ke card par paper count update karo
                    const updatedWorkspaces = savedWorkspaces.map(ws => {
                        // Agar backend paper ka workspace_id is workspace ke id se match karta hai
                        const count = papersData.filter((p: any) => p.workspace_id === ws.id || p.workspace_id === String(ws.id)).length;
                        return { ...ws, papers: count };
                    });
                    
                    setWorkspaces(updatedWorkspaces);
                } else {
                    setWorkspaces(savedWorkspaces);
                }
            } catch (error) {
                console.error("Failed to fetch papers", error);
                setWorkspaces(savedWorkspaces);
            }
        };

        fetchDashboardData();
    }, []);

    const handleCreateWorkspace = () => {
        const name = prompt("Enter Workspace Name:");
        if (!name) return;
        
        const newWs: Workspace = {
            id: Date.now(),
            name: name,
            description: 'New research project',
            date: new Date().toLocaleDateString('en-US'),
            papers: 0
        };
        
        const updatedWorkspaces = [newWs, ...workspaces];
        setWorkspaces(updatedWorkspaces);
        localStorage.setItem('researchWorkspaces', JSON.stringify(updatedWorkspaces));
    };

    const handleDelete = (id: number) => {
        if(window.confirm("Are you sure you want to delete this workspace?")) {
            const updated = workspaces.filter(ws => ws.id !== id);
            setWorkspaces(updated);
            localStorage.setItem('researchWorkspaces', JSON.stringify(updated));
        }
    };

    return (
        <div className="w-full bg-white min-h-[80vh] rounded-2xl p-8 shadow-sm border border-gray-100">
            {/* Header Area */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
                <p className="text-gray-500">Manage your research workspaces</p>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Workspaces Card */}
                <div className="p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between bg-white">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Total Workspaces</p>
                        <h2 className="text-3xl font-bold text-gray-900">{workspaces.length}</h2>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Folder className="text-purple-600 w-6 h-6" />
                    </div>
                </div>

                {/* Papers Imported Card */}
                <div className="p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between bg-white">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Papers Imported</p>
                        {/* 🌟 FIXED: Ab yahan actual backend count dikhega */}
                        <h2 className="text-3xl font-bold text-gray-900">{totalPapers}</h2>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <FileText className="text-green-600 w-6 h-6" />
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center bg-white">
                    <p className="text-sm text-gray-500 font-medium mb-3">Quick Actions</p>
                    <button 
                        onClick={() => navigate('/search')}
                        className="flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors w-max"
                    >
                        <Search className="w-4 h-4" />
                        Search Papers
                    </button>
                </div>
            </div>

            {/* Create Button */}
            <button 
                onClick={handleCreateWorkspace}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 mb-8 shadow-md"
            >
                <Plus className="w-5 h-5" />
                Create New Workspace
            </button>

            {/* Workspaces Grid */}
            {workspaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((ws) => (
                        <div 
                            key={ws.id} 
                            className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative cursor-pointer"
                            onClick={() => navigate(`/workspace/${ws.id}`)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-gray-900 truncate pr-4">{ws.name}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-md">
                                        {ws.papers} papers {/* 🌟 FIXED: Workspace ka real paper count */}
                                    </span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            handleDelete(ws.id);
                                        }}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                        title="Delete Workspace"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-6 truncate">{ws.description}</p>
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                                <Calendar className="w-3.5 h-3.5" />
                                Created {ws.date}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State UI */
                <div className="text-center py-20 text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium text-gray-600 mb-2">No workspaces yet</p>
                    <p className="text-sm text-gray-500">Create a new workspace to start organizing your research papers.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;