import React, { useState } from 'react';
import { Search, Filter, CheckSquare, Square, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

interface Paper {
    id: string;
    title: string;
    authors: string;
    abstract: string;
    date: string;
    source: string;
    citations: number;
    url: string;
}

const SearchPapers: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [results, setResults] = useState<Paper[]>([]);
    const [selectedPapers, setSelectedPapers] = useState<string[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        setResults([]); // Purane results clear karo

        try {
            // Semantic Scholar API call
            const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,abstract,year,url,citationCount`);
            
            if (!response.ok) throw new Error("API Limit Reached or Network Issue");
            
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const livePapers: Paper[] = data.data.map((p: any) => ({
                    id: p.paperId,
                    title: p.title || 'Untitled Research',
                    authors: p.authors?.length > 0 ? p.authors.map((a: any) => a.name).join(', ') : 'Authors not listed',
                    abstract: p.abstract || 'The abstract is not available for this paper. Please visit the source for full details.',
                    date: p.year ? p.year.toString() : 'N/A',
                    source: 'Semantic Scholar',
                    citations: p.citationCount || 0,
                    url: p.url || '#'
                }));
                setResults(livePapers);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error("Search failed:", error);
            // Fallback for Demo (Agar API fail ho jaye toh ye papers dikhenge)
            if (query.toLowerCase().includes('agentic')) {
                setResults([
                    {
                        id: 'demo-1',
                        title: 'AI Agents and Agentic AI-Navigating Future Concepts',
                        authors: 'Yinwang Ren, Yangyang Liu',
                        abstract: 'This paper discusses the rise of Agentic AI and its goal-directed autonomy in complex environments.',
                        date: '2025',
                        source: 'Demo Database',
                        citations: 5,
                        url: '#'
                    }
                ]);
            }
        } finally {
            setIsSearching(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedPapers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="w-full bg-white min-h-[80vh] rounded-2xl p-8 shadow-sm border border-gray-100 overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Search Papers</h1>
                <p className="text-gray-500">Find real-time research papers from global databases</p>
            </div>

            <form onSubmit={handleSearch} className="mb-8 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search topics like 'Agentic AI' or 'NLP'..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-purple-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-all disabled:opacity-50"
                >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                </button>
            </form>

            {/* Results */}
            {isSearching ? (
                <div className="flex flex-col items-center py-20 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-600" />
                    <p className="font-medium">Searching Semantic Scholar database...</p>
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-4 pb-10">
                    {results.map((paper) => (
                        <div 
                            key={paper.id} 
                            onClick={() => toggleSelection(paper.id)}
                            className={`p-6 border rounded-2xl transition-all cursor-pointer ${
                                selectedPapers.includes(paper.id) ? 'border-purple-500 bg-purple-50/30' : 'border-gray-100 hover:border-purple-200'
                            }`}
                        >
                            <div className="flex gap-4">
                                {selectedPapers.includes(paper.id) ? <CheckSquare className="text-purple-600" /> : <Square className="text-gray-300" />}
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 mb-1">{paper.title}</h3>
                                    <p className="text-xs text-purple-600 font-medium mb-3">{paper.authors}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{paper.abstract}</p>
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <span>Year: {paper.date}</span>
                                        <span>Citations: {paper.citations}</span>
                                        <a href={paper.url} target="_blank" className="text-purple-600 flex items-center gap-1"><ExternalLink className="w-3 h-3" /> View</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : hasSearched && (
                <div className="text-center py-20">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No papers found for "{query}". Try different keywords.</p>
                </div>
            )}
        </div>
    );
};

export default SearchPapers;