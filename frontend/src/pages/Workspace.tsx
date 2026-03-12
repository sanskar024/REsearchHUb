import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, MessageSquare, BookOpen, Trash2, Send, Sparkles, Upload, CheckCircle, Square, CheckSquare } from 'lucide-react';

interface Paper {
    id: number;
    title: string;
    authors: string;
    abstract: string;
}

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

const Workspace: React.FC = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState<'papers' | 'chat' | 'review'>('papers');
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [selectedPaperIds, setSelectedPaperIds] = useState<number[]>([]);
    const [uploading, setUploading] = useState(false);
    
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { role: 'ai', content: 'Hello! I am your Research Assistant. Please upload and select specific papers in the Library to start a focused analysis.' }
    ]);

    // 1. Fetch Papers belonging to this workspace
    const fetchPapers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/papers/list');
            const data = await response.json();
            // Filter papers by workspace_id
            const workspacePapers = data.filter((p: any) => p.workspace_id === (id ? parseInt(id) : 1));
            setPapers(workspacePapers);
        } catch (error) {
            console.error("Error fetching papers:", error);
        }
    };

    useEffect(() => {
        fetchPapers();
    }, [id]);

    // 2. Real PDF Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        
        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('workspace_id', id || "1");

        try {
            const response = await fetch('http://localhost:8000/api/papers/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                fetchPapers(); // Refresh library
            } else {
                alert("Upload failed. Check if backend is running.");
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    // 3. Delete Paper Logic
    const handleDeletePaper = async (paperId: number) => {
        if (!window.confirm("Delete this paper permanently?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/papers/${paperId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPapers(prev => prev.filter(p => p.id !== paperId));
                setSelectedPaperIds(prev => prev.filter(id => id !== paperId));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    // 4. Selection Toggle
    const toggleSelection = (paperId: number) => {
        setSelectedPaperIds(prev => 
            prev.includes(paperId) ? prev.filter(id => id !== paperId) : [...prev, paperId]
        );
    };

    // 5. Chat with Filtered Context (Sends selected_ids to Backend)
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        if (selectedPaperIds.length === 0) {
            alert("Please select at least one paper from the library to give the AI context!");
            return;
        }

        const userQuestion = chatInput;
        setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
        setChatInput('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:8000/api/papers/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userQuestion,
                    workspace_id: id ? parseInt(id) : 1,
                    selected_ids: selectedPaperIds // <-- NOW SENDING SPECIFIC IDS
                })
            });

            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'ai', content: data.response || "No response generated." }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', content: "⚠️ Connection Error: Is the FastAPI server running?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="w-full bg-white min-h-[85vh] rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-xs text-gray-400 hover:text-purple-600 mb-2 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Research Workspace</h1>
                </div>
                <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-xs font-bold border border-purple-100">
                    {selectedPaperIds.length} Papers Selected for AI
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
                {['papers', 'chat', 'review'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-8 py-4 text-sm font-bold border-b-2 capitalize transition-all ${
                            activeTab === tab ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab === 'papers' ? 'Library' : tab === 'chat' ? 'AI Assistant' : 'Literature Review'}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/20">
                {/* LIBRARY (PAPERS) TAB */}
                {activeTab === 'papers' && (
                    <div className="p-8 space-y-6 overflow-y-auto max-w-5xl mx-auto w-full">
                        {/* Upload Box */}
                        <div className="border-2 border-dashed border-purple-200 rounded-3xl p-10 text-center bg-white hover:bg-purple-50/30 transition-all group shadow-sm">
                            <input type="file" id="file-up" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploading} />
                            <label htmlFor="file-up" className="cursor-pointer flex flex-col items-center">
                                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-inner">
                                    <Upload className={uploading ? 'animate-bounce' : ''} />
                                </div>
                                <p className="font-bold text-gray-800 text-lg">{uploading ? 'Analyzing Document...' : 'Upload New Research PDF'}</p>
                                <p className="text-sm text-gray-400 mt-2">Upload papers to add them to this workspace library</p>
                            </label>
                        </div>

                        {/* Papers List */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Workspace Library</h3>
                            {papers.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 text-gray-400 shadow-sm">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="font-medium italic">No papers uploaded yet.</p>
                                </div>
                            ) : (
                                papers.map((p) => (
                                    <div 
                                        key={p.id} 
                                        className={`group p-5 border rounded-2xl flex items-center gap-4 transition-all shadow-sm ${
                                            selectedPaperIds.includes(p.id) ? 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-500' : 'bg-white border-gray-200 hover:border-purple-200'
                                        }`}
                                    >
                                        <button onClick={() => toggleSelection(p.id)} className="shrink-0 transition-transform active:scale-90">
                                            {selectedPaperIds.includes(p.id) ? (
                                                <CheckSquare className="w-6 h-6 text-purple-600" />
                                            ) : (
                                                <Square className="w-6 h-6 text-gray-300 group-hover:text-purple-300" />
                                            )}
                                        </button>
                                        
                                        <div className="flex-1 cursor-pointer" onClick={() => toggleSelection(p.id)}>
                                            <p className="font-bold text-gray-800 text-base">{p.title}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold">PDF</span>
                                                <span className="text-[10px] text-gray-400 font-medium">Paper ID: {p.id}</span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleDeletePaper(p.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete Paper"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* AI ASSISTANT (CHAT) TAB */}
                {activeTab === 'chat' && (
                    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6 overflow-hidden">
                        <div className="flex-1 bg-white border border-gray-200 rounded-3xl shadow-lg flex flex-col overflow-hidden">
                            {/* Chat Header Status */}
                            <div className="px-6 py-3 border-b border-gray-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">AI Memory Active</span>
                                </div>
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded uppercase">
                                    Context: {selectedPaperIds.length} Selected
                                </span>
                            </div>

                            {/* Chat History */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-purple-600 text-white rounded-br-none shadow-md shadow-purple-100' 
                                            : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-bl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-purple-50 border border-purple-100 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-3">
                                            <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                                            <span className="text-xs text-purple-700 font-bold italic">AI Agent is studying selected papers...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Chat Input */}
                            <form onSubmit={handleSendMessage} className="p-5 border-t border-gray-100 flex gap-3 bg-white">
                                <input 
                                    type="text" 
                                    value={chatInput} 
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={selectedPaperIds.length > 0 ? "Ask anything about selected papers..." : "⚠️ Select papers in Library tab first"}
                                    className={`flex-1 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-purple-500/20 transition-all ${
                                        selectedPaperIds.length > 0 ? 'bg-gray-50' : 'bg-red-50 placeholder-red-400'
                                    }`}
                                    disabled={selectedPaperIds.length === 0}
                                />
                                <button 
                                    type="submit" 
                                    disabled={isTyping || selectedPaperIds.length === 0} 
                                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white px-8 rounded-2xl transition-all shadow-lg shadow-purple-100 flex items-center justify-center group"
                                >
                                    <Send className={`w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform`} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workspace;