import React, { useState, useEffect } from 'react';
import { FileText, Lightbulb, BookOpen, Play, Sparkles, X, Loader2, CheckSquare, Square, Upload, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AITools: React.FC = () => {
    // Navigation hook
    const navigate = useNavigate();

    // States for functional logic
    const [papers, setPapers] = useState<any[]>([]);
    const [selectedPaperIds, setSelectedPaperIds] = useState<number[]>([]);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalData, setModalData] = useState({ title: '', result: '' });

    // 1. Fetch papers from backend database
    useEffect(() => {
        const fetchPapers = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/papers/list');
                if (response.ok) {
                    const data = await response.json();
                    setPapers(data);
                }
            } catch (error) {
                console.error("Failed to fetch papers:", error);
            }
        };
        fetchPapers();
    }, []);

    // 2. Multi-select Checkbox Logic
    const toggleSelection = (id: number) => {
        setSelectedPaperIds(prev => 
            prev.includes(id) ? prev.filter(paperId => paperId !== id) : [...prev, id]
        );
    };

    // 3. Action Logic for the 3 Buttons
    const handleAction = (actionType: string) => {
        if (selectedPaperIds.length === 0) {
            alert("Bhai, pehle list mein se kam se kam ek paper toh select karo! 📄");
            return;
        }

        setIsModalOpen(true);
        setIsLoading(true);

        const selectedDocs = papers.filter(p => selectedPaperIds.includes(p.id));
        
        // Simulating different AI behaviors based on button clicked
        setTimeout(() => {
            let resultText = "";
            let modalTitle = "";

            if (actionType === 'summary') {
                modalTitle = "AI Summaries";
                resultText = selectedDocs.map(d => `📌 **Summary for: ${d.title}**\n${d.abstract || 'No abstract available.'}`).join('\n\n---\n\n');
            } else if (actionType === 'insights') {
                modalTitle = "Key Insights";
                resultText = selectedDocs.map(d => `💡 **Key Insights from: ${d.title}**\n• The primary focus is on advancing AI methodologies.\n• Key trend indicates strong reliance on multi-agent systems.\n• Further research is required in ethical boundaries.`).join('\n\n');
            } else if (actionType === 'review') {
                modalTitle = "Literature Review";
                resultText = `📚 **Comprehensive Literature Review**\n\nBased on the ${selectedDocs.length} selected papers, the current state of research highlights significant advancements. Specifically:\n\n` + selectedDocs.map(d => `- **${d.title}** contributes heavily to the core domain, outlining fundamental architectures.`).join('\n');
            }

            setModalData({ title: modalTitle, result: resultText });
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="p-10 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-5xl mx-auto">
                
                {/* 🌟 Updated Header with Quick Action Buttons */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Tools</h1>
                        <p className="text-sm text-gray-500 font-medium">
                            AI-powered research analysis tools • {papers.length} papers available • {selectedPaperIds.length} selected
                        </p>
                    </div>
                    
                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/upload')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 font-semibold text-sm transition-all shadow-sm"
                        >
                            <Upload className="w-4 h-4" /> Add Paper
                        </button>
                        <button 
                            onClick={() => navigate('/docspace')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 font-semibold text-sm transition-all shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" /> Manage / Delete
                        </button>
                    </div>
                </div>

                {/* 🌟 Selection Box matching image_9d5dcc.png */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center gap-2 mb-5">
                        <FileText className="w-5 h-5 text-gray-700" />
                        <h2 className="text-[17px] font-bold text-gray-800">Select Papers for Analysis</h2>
                    </div>
                    
                    <div className="space-y-3">
                        {papers.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <p className="text-sm text-gray-500 font-medium mb-3">No papers found in your workspace.</p>
                                <button 
                                    onClick={() => navigate('/upload')}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700"
                                >
                                    <Upload className="w-4 h-4" /> Upload your first PDF
                                </button>
                            </div>
                        ) : (
                            papers.map((paper) => (
                                <div 
                                    key={paper.id} 
                                    onClick={() => toggleSelection(paper.id)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all border flex items-center gap-4 ${
                                        selectedPaperIds.includes(paper.id) 
                                        ? 'border-purple-600 bg-purple-50/30' 
                                        : 'border-gray-200 hover:border-purple-200'
                                    }`}
                                >
                                    {/* Checkbox Icon */}
                                    <div>
                                        {selectedPaperIds.includes(paper.id) 
                                            ? <CheckSquare className="w-5 h-5 text-purple-600" /> 
                                            : <Square className="w-5 h-5 text-gray-300" />
                                        }
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-bold text-gray-800 text-[14px] truncate">{paper.title}</h3>
                                        <p className="text-[12px] text-gray-400 mt-0.5 truncate">Research Paper extracted from Workspace</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Selected Counter */}
                    <div className="mt-4 px-1">
                        <p className="text-[13px] font-medium text-purple-600">{selectedPaperIds.length} paper(s) selected</p>
                    </div>
                </div>

                {/* 🌟 3 Action Cards matching image_9d5dcc.png */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: AI Summaries */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-blue-600"><Sparkles className="w-6 h-6" /></div>
                            <h3 className="text-[16px] font-bold text-gray-800">AI Summaries</h3>
                        </div>
                        <p className="text-[13px] text-gray-500 mb-6 leading-relaxed flex-1">
                            Generate concise summaries of selected research papers
                        </p>
                        <button 
                            onClick={() => handleAction('summary')}
                            className="flex items-center justify-center gap-2 w-full bg-[#1A56DB] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-all"
                        >
                            <Play className="w-4 h-4 fill-current" /> Generate Summaries
                        </button>
                    </div>

                    {/* Card 2: Key Insights */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-[#D97706]"><Lightbulb className="w-6 h-6" /></div>
                            <h3 className="text-[16px] font-bold text-gray-800">Key Insights</h3>
                        </div>
                        <p className="text-[13px] text-gray-500 mb-6 leading-relaxed flex-1">
                            Extract key insights and trends from research papers
                        </p>
                        <button 
                            onClick={() => handleAction('insights')}
                            className="flex items-center justify-center gap-2 w-full bg-[#D97706] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-all"
                        >
                            <Sparkles className="w-4 h-4" /> Extract Insights
                        </button>
                    </div>

                    {/* Card 3: Literature Review */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-green-600"><BookOpen className="w-6 h-6" /></div>
                            <h3 className="text-[16px] font-bold text-gray-800">Literature Review</h3>
                        </div>
                        <p className="text-[13px] text-gray-500 mb-6 leading-relaxed flex-1">
                            Generate comprehensive literature reviews automatically
                        </p>
                        <button 
                            onClick={() => handleAction('review')}
                            className="flex items-center justify-center gap-2 w-full bg-[#059669] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all"
                        >
                            <BookOpen className="w-4 h-4" /> Generate Review
                        </button>
                    </div>
                </div>
            </div>

            {/* 🌟 Functional Modal for Results */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" /> {modalData.title}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 min-h-[250px] max-h-[60vh] overflow-y-auto bg-white">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-purple-600 py-10 space-y-3">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <p className="font-medium text-sm text-gray-500">Processing {selectedPaperIds.length} paper(s)...</p>
                                </div>
                            ) : (
                                <div className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                                    {modalData.result}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex justify-end">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AITools;