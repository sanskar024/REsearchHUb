import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, FileText, BookOpen, CheckCircle2 } from 'lucide-react';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || '';

    // Features data mapping
    const features = [
        {
            icon: <Search className="text-purple-500 w-8 h-8" />,
            title: "Smart Paper Search",
            description: "Find research papers across multiple databases with AI-powered search"
        },
        {
            icon: <MessageSquare className="text-purple-500 w-8 h-8" />,
            title: "AI Chat Assistant",
            description: "Ask questions about your research papers and get intelligent responses"
        },
        {
            icon: <FileText className="text-purple-500 w-8 h-8" />,
            title: "DocSpace Editor",
            description: "Create and edit documents with rich text formatting like Google Docs"
        },
        {
            icon: <BookOpen className="text-purple-500 w-8 h-8" />,
            title: "Literature Review",
            description: "Generate comprehensive literature reviews from selected papers"
        }
    ];

    const benefits = [
        "Save 80% time on literature review",
        "Access millions of research papers",
        "AI-powered insights and summaries",
        "Collaborative workspace features",
        "Export to multiple formats"
    ];

    return (
        <div className="flex flex-col items-center bg-white min-h-screen rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Top Section / Hero Area */}
            <div className="w-full pt-16 pb-20 px-8 text-center flex flex-col items-center">
                <div className="mb-4 flex items-center gap-2 text-gray-500 font-medium w-full justify-between">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">✨</span>
                        <span className="font-bold text-gray-800 text-lg">ResearchHub AI</span>
                    </div>
                    {userName && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm">Welcome, {userName.split(' ')[0]}!</span>
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Go to Dashboard →
                            </button>
                        </div>
                    )}
                </div>

                <h1 className="text-5xl font-extrabold text-gray-900 mt-10 mb-6 tracking-tight">
                    Your AI-Powered <span className="text-purple-600">Research Assistant</span>
                </h1>
                
                <p className="text-gray-500 max-w-2xl text-lg mb-10 leading-relaxed">
                    Accelerate your research with intelligent paper discovery, AI-powered insights, and collaborative document editing - all in one platform.
                </p>

                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/search')}
                        className="bg-purple-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-purple-600 transition-colors shadow-md shadow-purple-200"
                    >
                        Start Researching
                    </button>
                    <button 
                        onClick={() => navigate('/docspace')}
                        className="border-2 border-purple-200 text-purple-600 px-8 py-3.5 rounded-full font-semibold hover:bg-purple-50 transition-colors"
                    >
                        Try DocSpace
                    </button>
                </div>
            </div>

            {/* Features Section */}
            <div className="w-full py-16 px-10 bg-gray-50/50">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
                    Powerful Features for Modern Research
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="font-bold text-gray-800 mb-3">{feature.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Why Choose Section (Purple Banner) */}
            <div className="w-full bg-purple-600 text-white py-16 px-8 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-10">Why Choose ResearchHub AI?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 max-w-5xl mx-auto">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <CheckCircle2 className="text-purple-300 w-6 h-6 shrink-0" />
                            <span className="font-medium">{benefit}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Home;