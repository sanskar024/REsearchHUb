import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Brain, Save, Download, Loader2 } from 'lucide-react';

const UploadPDF: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [displayText, setDisplayText] = useState(""); // UI par dikhane ke liye
    const [rawText, setRawText] = useState(""); // AI ko bhejne ke liye clean text

    // 1. File Select & Auto-Extract
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setIsProcessing(true);
            setDisplayText("Extracting content... Please wait.");

            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await fetch('http://localhost:8000/api/papers/extract_text', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                
                if (data.text && !data.text.includes("Error")) {
                    setRawText(data.text);
                    setDisplayText(data.text); // Initially full text dikhao
                } else {
                    setDisplayText(data.text || "Error: Could not extract text.");
                }
            } catch (error) {
                setDisplayText("Connection Error: Backend is not reachable.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // 2. Smart AI Summary Logic
    const handleGenerateSummary = async () => {
        if (!rawText || rawText.length < 10) return alert("No readable text found to summarize!");
        
        setIsProcessing(true);
        setDisplayText("AI is analyzing the document structure... 🧠");

        try {
            const response = await fetch('http://localhost:8000/api/papers/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Instructing AI to handle Syllabus/Research specifically
                    query: `Summarize this document. If it's a syllabus, list key modules and evaluation schemes. 
                           If it's a paper, summarize findings. Text: ${rawText.substring(0, 4000)}`,
                    workspace_id: 1 
                })
            });
            const data = await response.json();
            
            // UI Formatting
            const finalView = `✨ AI RESEARCH SUMMARY\n━━━━━━━━━━━━━━━━━━━━\n${data.response}\n\n📄 ORIGINAL CONTENT PREVIEW\n━━━━━━━━━━━━━━━━━━━━\n${rawText.substring(0, 1500)}...`;
            setDisplayText(finalView);
        } catch (error) {
            alert("Summary generation failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    // 3. Save to Library
    const handleSave = async () => {
        if (!file) return;
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('workspace_id', "1");

        try {
            await fetch('http://localhost:8000/api/papers/upload', { method: 'POST', body: formData });
            alert("Saved to Workspace Library! ✅");
        } catch (error) {
            alert("Save failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-10 bg-white min-h-[90vh] rounded-3xl border border-gray-100 shadow-sm overflow-y-auto">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Upload Research Paper</h1>
                <p className="text-gray-500 mb-10 text-sm">Convert complex PDFs into structured AI insights</p>
                
                {/* Upload Zone */}
                <div className="border-2 border-dashed border-purple-100 rounded-[40px] p-20 mb-8 bg-purple-50/5 relative group hover:bg-purple-50/20 transition-all">
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                        <Upload className={`w-16 h-16 mb-4 ${isProcessing ? 'animate-bounce text-purple-400' : 'text-purple-600'}`} />
                        <span className="text-lg font-bold text-gray-800 italic underline">Select PDF File</span>
                    </div>

                    {file && (
                        <div className="mt-8 bg-white border border-green-200 text-green-700 px-6 py-3 rounded-2xl flex items-center gap-2 mx-auto w-fit shadow-md font-bold text-[11px]">
                            <FileText className="w-4 h-4" /> {file.name} <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <button onClick={handleGenerateSummary} disabled={isProcessing || !rawText} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-30 transition-all">
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} Generate AI Summary
                    </button>
                    <button onClick={handleSave} disabled={isProcessing || !file} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-30 transition-all">
                        <Save className="w-4 h-4" /> Save to Workspace
                    </button>
                    <button className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all">
                        <Download className="w-4 h-4" /> Download Text
                    </button>
                </div>

                {/* Result Box */}
                <div className="mt-12 text-left">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 px-2">
                        <FileText className="w-5 h-5 text-purple-600" /> Extracted Text:
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 min-h-[350px] text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
                        {displayText || "Upload a paper to see the AI magic here..."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPDF;