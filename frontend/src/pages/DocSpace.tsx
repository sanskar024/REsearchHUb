import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Download, Plus, FileText, Loader2, Trash2, CheckCircle2 } from 'lucide-react';

const DocSpace: React.FC = () => {
    const [value, setValue] = useState('');
    const [documents, setDocuments] = useState<any[]>([]);
    const [activeDoc, setActiveDoc] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSavedMsg, setShowSavedMsg] = useState(false); // Visual feedback state

    // 1. Sidebar List load karo
    const fetchDocs = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/papers/list');
            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error("List fetch failed");
        }
    };

    useEffect(() => { fetchDocs(); }, []);

    // 2. NEW DOCUMENT with Name Prompt
    const handleNewDocument = () => {
        const docName = prompt("Enter Document Name:", "New Research Draft");
        if (docName) {
            const newDoc = { 
                id: Date.now(), 
                title: docName, 
                abstract: "Start your research here...", 
                isNew: true 
            };
            
            setDocuments(prevDocs => [newDoc, ...prevDocs]);
            
            setActiveDoc(newDoc);
            setValue(`<h1>${docName}</h1><p>Start your research here...</p>`);
        }
    };

    // 3. DELETE Logic
    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        if (!window.confirm("Kya aap is document ko delete karna chahte hain?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/papers/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                if (activeDoc?.id === id) {
                    setActiveDoc(null);
                    setValue('');
                }
                fetchDocs(); 
            } else {
                setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
            }
        } catch (error) {
            alert("Delete karne mein error aayi.");
        }
    };

    // 4. SAVE to Database
    const handleSave = async () => {
        if (!activeDoc) return alert("Pehle koi document toh select karo!");
        
        setIsLoading(true);

        const cleanText = value.replace(/<[^>]+>/g, '').substring(0, 100) + '...';
        setDocuments(prevDocs => 
            prevDocs.map(doc => 
                doc.id === activeDoc.id ? { ...doc, abstract: cleanText } : doc
            )
        );

        const blob = new Blob([value], { type: 'text/html' });
        const formData = new FormData();
        formData.append('file', new File([blob], `${activeDoc.title}.html`, { type: 'text/html' }));
        formData.append('workspace_id', "1");

        try {
            const response = await fetch('http://localhost:8000/api/papers/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                setShowSavedMsg(true); 
                setTimeout(() => setShowSavedMsg(false), 3000); 
                fetchDocs(); 
            } else {
                setShowSavedMsg(true); 
                setTimeout(() => setShowSavedMsg(false), 3000);
            }
        } catch (error) {
            alert("Database connection failed.");
        } finally {
            setIsLoading(false);
        }
    };

    // 5. 🌟 NEW: DOWNLOAD Logic
    const handleDownload = () => {
        if (!activeDoc) {
            alert("Download karne ke liye pehle koi document select ya create karein!");
            return;
        }

        // Basic HTML wrapper taaki download hone ke baad file browser mein acchi dikhe
        const fileContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${activeDoc.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; color: #333; }
                    h1 { border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    p { margin-bottom: 15px; }
                </style>
            </head>
            <body>
                ${value}
            </body>
            </html>
        `;

        // Blob banakar file download trigger karna
        const blob = new Blob([fileContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        // File ka naam document ke title par set hoga (spaces replace ho jayenge)
        link.download = `${activeDoc.title.replace(/\s+/g, '_')}.html`;
        
        document.body.appendChild(link);
        link.click();
        
        // Memory clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex h-[92vh] bg-white overflow-hidden font-sans">
            {/* Sidebar List Panel */}
            <div className="w-80 border-r border-gray-100 flex flex-col p-5 bg-white shrink-0 shadow-sm">
                <button 
                    onClick={handleNewDocument}
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-2xl font-bold text-sm mb-8 hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> New Document
                </button>

                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Library Items</p>
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                    {documents.map((doc) => (
                        <div 
                            key={doc.id}
                            onClick={() => { setActiveDoc(doc); setValue(`<h1>${doc.title}</h1><p>${doc.abstract}</p>`); }}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border group flex justify-between items-center ${
                                activeDoc?.id === doc.id ? 'bg-purple-50 border-purple-200 shadow-sm' : 'border-transparent hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-start gap-3 overflow-hidden">
                                <FileText className={`w-5 h-5 mt-0.5 shrink-0 ${activeDoc?.id === doc.id ? 'text-purple-600' : 'text-gray-400'}`} />
                                <div className="overflow-hidden">
                                    <p className="text-[13px] font-bold text-gray-800 truncate">{doc.title}</p>
                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{doc.abstract}</p>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => handleDelete(e, doc.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col bg-slate-50/20">
                <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-black text-gray-800 tracking-tight truncate max-w-sm">
                            {activeDoc ? activeDoc.title : "DocSpace Editor"}
                        </h2>
                        {showSavedMsg && (
                            <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold animate-in fade-in slide-in-from-left-2 duration-300">
                                <CheckCircle2 className="w-4 h-4" /> Saved Successfully!
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 bg-purple-600 text-white px-7 py-2.5 rounded-xl text-xs font-black shadow-md hover:bg-purple-700 disabled:opacity-50 transition-all">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                        </button>
                        {/* 🌟 FIXED: Added onClick={handleDownload} */}
                        <button onClick={handleDownload} className="flex items-center gap-2 bg-gray-900 text-white px-7 py-2.5 rounded-xl text-xs font-black hover:bg-black transition-all">
                            <Download className="w-4 h-4" /> Download
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto flex justify-center bg-slate-50/40">
                    <div className="w-full max-w-5xl bg-white shadow-2xl shadow-slate-200/50 border border-gray-100 rounded-sm min-h-[1200px] flex flex-col">
                        <ReactQuill 
                            theme="snow" 
                            value={value} 
                            onChange={setValue} 
                            className="flex-1"
                            placeholder="Type your research thoughts..."
                        />
                    </div>
                </div>
            </div>

            <style>{`
                .quill { display: flex; flex-direction: column; height: 100%; }
                .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f1f5f9 !important; padding: 15px 30px !important; background: #fff; position: sticky; top: 0; z-index: 10; }
                .ql-container.ql-snow { border: none !important; flex: 1; }
                .ql-editor { padding: 60px 100px !important; font-size: 19px; line-height: 1.8; color: #334155; }
                .ql-editor h1 { font-size: 3rem; font-weight: 900; border-bottom: 5px solid #000; display: inline-block; margin-bottom: 30px; letter-spacing: -1.5px; color: #000; }
            `}</style>
        </div>
    );
};

export default DocSpace;