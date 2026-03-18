
import React, { useState, useEffect } from 'react';
import { getInstagramTrends } from '../services/geminiService';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

interface SentimentAnalyzerProps {
  meghanMode?: boolean;
}

const SentimentAnalyzer: React.FC<SentimentAnalyzerProps> = ({ meghanMode }) => {
  const { data: trends, loading, error, refresh } = useAutoRefresh('instagram_trends', getInstagramTrends);
  const [showAdminControls, setShowAdminControls] = useState(false);

  useEffect(() => {
    if (meghanMode) {
      setShowAdminControls(true);
    } else {
      setShowAdminControls(false);
    }
  }, [meghanMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret shortcut: Ctrl + Shift + Alt + I (for Instagram)
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'I') {
        setShowAdminControls(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const exportToCSV = () => {
    if (trends.length === 0) return;

    const headers = ["Topic", "Instagram Caption", "Canva Prompt", "Hashtags"];
    const rows = trends.map(t => [
      `"${t.topic.replace(/"/g, '""')}"`,
      `"${t.instagramWriteup.replace(/"/g, '""')}"`,
      `"${t.canvaPrompt.replace(/"/g, '""')}"`,
      `"${t.hashtags.join(', ').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `esthetician_instagram_trends_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <h2 className="text-4xl font-serif font-bold text-stone-900 mb-2">Instagram Sentiment Analyzer</h2>
              <p className="text-stone-500 max-w-2xl font-medium">
                Social trend extraction for the Esthetician industry. We analyze current visual trends and consumer sentiment to provide you with ready-to-post content.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-4">
              <div className={`flex gap-3 transition-opacity duration-300 ${showAdminControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button 
                  onClick={refresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-rose-800 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Scoping Trends...</>
                  ) : (
                    <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg> Analyze IG Trends</>
                  )}
                </button>
                {trends.length > 0 && (
                  <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-6 py-2 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all shadow-lg active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export to Sheet
                  </button>
                )}
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

        {trends.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-stone-200 rounded-3xl bg-white/50">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-800 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-800">Visual Trend Scouter</h3>
            <p className="text-stone-400 max-w-sm text-center mt-2">Click "Analyze IG Trends" to pull the most engaged topics from the Instagram beauty community.</p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm animate-pulse">
                <div className="h-6 w-1/3 bg-stone-100 rounded mb-4"></div>
                <div className="h-4 w-full bg-stone-50 rounded mb-2"></div>
                <div className="h-4 w-full bg-stone-50 rounded mb-2"></div>
                <div className="h-20 w-full bg-stone-100 rounded mt-6"></div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {trends.map((trend, index) => (
            <div key={index} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col lg:flex-row group transition-all hover:shadow-xl">
              <div className="p-8 lg:w-1/2 border-b lg:border-b-0 lg:border-r border-stone-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-800 text-white text-xs font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">{trend.topic}</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Instagram Caption</p>
                    <div className="p-5 bg-stone-50 rounded-2xl text-stone-600 text-sm leading-relaxed border border-stone-100 whitespace-pre-wrap italic font-serif relative">
                      "{trend.instagramWriteup}"
                      <button 
                        onClick={() => navigator.clipboard.writeText(trend.instagramWriteup)}
                        className="absolute top-2 right-2 p-1.5 text-stone-300 hover:text-stone-900 transition-colors"
                        title="Copy Caption"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Hashtags</p>
                    <div className="flex flex-wrap gap-2">
                      {trend.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs font-medium text-rose-700">#{tag.replace(/^#/, '')}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 lg:w-1/2 bg-stone-50/50 flex flex-col">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Canva AI Visual Prompt</p>
                  <div className="p-5 bg-white rounded-2xl text-stone-700 text-sm leading-relaxed border border-stone-200 shadow-inner group-hover:border-rose-200 transition-colors">
                    <p className="font-medium mb-2">Prompt:</p>
                    <p className="text-stone-500 italic">"{trend.canvaPrompt}"</p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(trend.canvaPrompt)}
                      className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-800 hover:text-rose-950 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Copy Prompt for Canva
                    </button>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-stone-200/50 flex items-center justify-between text-[10px] text-stone-400 font-medium tracking-widest uppercase">
                  <span>Sentiment Analysis Positive</span>
                  <span>Estimated Engagement High</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalyzer;
