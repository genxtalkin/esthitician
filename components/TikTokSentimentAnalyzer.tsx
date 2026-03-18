
import React, { useState, useEffect } from 'react';
import { getTikTokTrends } from '../services/geminiService';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

interface TikTokSentimentAnalyzerProps {
  meghanMode?: boolean;
}

const TikTokSentimentAnalyzer: React.FC<TikTokSentimentAnalyzerProps> = ({ meghanMode }) => {
  const { data: trends, loading, error, refresh } = useAutoRefresh('tiktok_trends', getTikTokTrends);
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
      // Secret shortcut: Ctrl + Shift + Alt + T (for TikTok)
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'T') {
        setShowAdminControls(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const exportToCSV = () => {
    if (trends.length === 0) return;

    const headers = ["Topic", "TikTok Script", "Canva Prompt", "Hashtags"];
    const rows = trends.map(t => [
      `"${t.topic.replace(/"/g, '""')}"`,
      `"${t.tiktokScript.replace(/"/g, '""')}"`,
      `"${t.canvaPrompt.replace(/"/g, '""')}"`,
      `"${t.hashtags.join(', ').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `esthetician_tiktok_trends_${new Date().toISOString().split('T')[0]}.csv`);
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
    <div className="flex-1 overflow-y-auto bg-[#000000] p-4 md:p-10 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-serif font-bold text-white mb-2">TikTok Sentiment Analyzer</h2>
              <p className="text-stone-400 max-w-2xl font-medium">
                Viral trend extraction for the Esthetician community. We analyze high-engagement hooks and visual storytelling patterns to keep you ahead of the TikTok algorithm.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-4">
              <div className={`flex gap-3 transition-opacity duration-300 ${showAdminControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button 
                  onClick={refresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-[#ff0050] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#d00040] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Syncing...</>
                  ) : (
                    <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg> Analyze TikTok</>
                  )}
                </button>
                {trends.length > 0 && (
                  <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-6 py-2 bg-stone-800 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-stone-700 transition-all shadow-lg active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export
                  </button>
                )}
              </div>
              
              <div className="bg-stone-900 px-6 py-3 rounded-2xl border border-stone-800 shadow-sm text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Data Capture Period</p>
                <p className="text-xs font-serif italic text-[#00f2fe]">
                  {formatDate(sevenDaysAgo)} — {formatDate(today)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="p-4 mb-8 bg-rose-900/20 border border-rose-900/50 text-rose-200 rounded-xl text-sm italic">
            {error}
          </div>
        )}

        {loading && trends.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-stone-900 p-6 rounded-3xl border border-stone-800 shadow-sm animate-pulse">
                <div className="h-6 w-1/3 bg-stone-800 rounded mb-4"></div>
                <div className="h-4 w-full bg-stone-800 rounded mb-2"></div>
                <div className="h-20 w-full bg-stone-800 rounded mt-6"></div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {trends.map((trend, index) => (
            <div key={index} className="bg-stone-900 rounded-3xl border border-stone-800 shadow-sm overflow-hidden flex flex-col lg:flex-row group transition-all hover:border-stone-700">
              <div className="p-8 lg:w-1/2 border-b lg:border-b-0 lg:border-r border-stone-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00f2ea] text-black text-xs font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-white">{trend.topic}</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">TikTok Hook & Script</p>
                    <div className="p-5 bg-black rounded-2xl text-stone-300 text-sm leading-relaxed border border-stone-800 whitespace-pre-wrap italic font-serif relative">
                      "{trend.tiktokScript}"
                      <button 
                        onClick={() => navigator.clipboard.writeText(trend.tiktokScript)}
                        className="absolute top-2 right-2 p-1.5 text-stone-600 hover:text-white transition-colors"
                        title="Copy Script"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Trending Hashtags</p>
                    <div className="flex flex-wrap gap-2">
                      {trend.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs font-medium text-[#ff0050]">#{tag.replace(/^#/, '')}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 lg:w-1/2 bg-stone-950 flex flex-col">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Canva AI Video Prompt</p>
                  <div className="p-5 bg-stone-900 rounded-2xl text-stone-300 text-sm leading-relaxed border border-stone-800 shadow-inner group-hover:border-stone-700 transition-colors">
                    <p className="font-medium mb-2 text-white">Prompt:</p>
                    <p className="text-stone-400 italic">"{trend.canvaPrompt}"</p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(trend.canvaPrompt)}
                      className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#00f2ea] hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Copy Prompt
                    </button>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-500 font-medium tracking-widest uppercase">
                  <span>Viral Potential: Extreme</span>
                  <span>Algorithm Fit: Optimized</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TikTokSentimentAnalyzer;
