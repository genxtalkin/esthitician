
import React, { useState, useEffect } from 'react';
import { getIndustryArticles } from '../services/geminiService';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

interface IndustryTrendsProps {
  meghanMode?: boolean;
}

const IndustryTrends: React.FC<IndustryTrendsProps> = ({ meghanMode }) => {
  const { data: articles, loading, error, refresh } = useAutoRefresh('industry_articles', getIndustryArticles);
  const [showAdminControls, setShowAdminControls] = useState(false);

  // Sync admin controls with meghanMode
  useEffect(() => {
    if (meghanMode) {
      setShowAdminControls(true);
    } else {
      setShowAdminControls(false);
    }
  }, [meghanMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret shortcut: Ctrl + Shift + Alt + A (for Articles)
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'A') {
        setShowAdminControls(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate date range for the top display
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#faf9f6] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-serif font-bold text-stone-900 mb-2">Esthetician Industry Trends</h2>
              <p className="text-stone-500 max-w-2xl font-medium">
                A curated breakdown of the most significant articles, clinical news, and advertisements from the last 7 days.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-4">
              <div className={`transition-opacity duration-300 ${showAdminControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button 
                  onClick={refresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-rose-800 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Updating...</>
                  ) : (
                    <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg> Refresh Trends</>
                  )}
                </button>
              </div>
              
              <div className="bg-white px-6 py-3 rounded-2xl border border-stone-200 shadow-sm text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Data Capture Period</p>
                <p className="text-xs font-serif italic text-rose-800">
                  {formatDate(sevenDaysAgo)} — {formatDate(today)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="p-4 mb-8 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-sm italic">
            {error}
          </div>
        )}

        {loading && articles.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm animate-pulse">
                <div className="h-4 w-1/4 bg-stone-100 rounded mb-4"></div>
                <div className="h-6 w-3/4 bg-stone-100 rounded mb-4"></div>
                <div className="h-20 w-full bg-stone-50 rounded mb-4"></div>
                <div className="h-4 w-1/2 bg-stone-100 rounded"></div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div key={index} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-800 bg-rose-50 px-2 py-1 rounded">
                    {article.sourceName}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">{article.date}</span>
                </div>
                
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-4 leading-tight group-hover:text-rose-900 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-stone-600 text-sm leading-relaxed italic font-serif mb-6">
                  "{article.summary}"
                </p>
              </div>
              
              <div className="px-6 py-4 bg-stone-50 border-t border-stone-100">
                <a 
                  href={article.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-rose-800 transition-colors"
                >
                  View Original Source
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {articles.length === 0 && !loading && !error && (
          <div className="text-center py-20">
            <p className="text-stone-400 italic font-serif">No trends captured for this period yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndustryTrends;
