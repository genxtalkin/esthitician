
import React, { useState, useCallback, useEffect } from 'react';
import MindMap from './components/MindMap';
import SentimentAnalyzer from './components/SentimentAnalyzer';
import LinkedInSentimentAnalyzer from './components/LinkedInSentimentAnalyzer';
import TikTokSentimentAnalyzer from './components/TikTokSentimentAnalyzer';
import IndustryTrends from './components/IndustryTrends';
import Blog from './components/Blog';
import Connect from './components/Connect';
import { INITIAL_DATA } from './constants';
import { MindNode, NodeInsights } from './types';
import { getIndustryInsights } from './services/geminiService';

type Page = 'cloud' | 'instagram' | 'linkedin' | 'tiktok' | 'trends' | 'blog' | 'connect';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('cloud');
  const [data, setData] = useState(INITIAL_DATA);
  const [selectedNode, setSelectedNode] = useState<MindNode | null>(null);
  const [insights, setInsights] = useState<NodeInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meghanMode, setMeghanMode] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleNodeClick = useCallback(async (node: MindNode) => {
    setSelectedNode(node);
    setLoading(true);
    setError(null);
    setInsights(null);

    try {
      const result = await getIndustryInsights(node.label);
      setInsights(result);
    } catch (err: any) {
      const errorMessage = err.message || String(err);
      setError(`Unable to load deep insights for this topic: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleMeghanMode = useCallback(() => {
    setMeghanMode(prev => {
      const next = !prev;
      if (!next && ['instagram', 'linkedin', 'tiktok'].includes(activePage)) {
        setActivePage('cloud');
      }
      return next;
    });
  }, [activePage]);

  const handleLogoPressStart = () => {
    const timer = setTimeout(() => {
      toggleMeghanMode();
      // Optional: Add a small haptic feedback if supported
      if ('vibrate' in navigator) navigator.vibrate(50);
    }, 2000); // 2 second long press
    setPressTimer(timer);
  };

  const handleLogoPressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret shortcut: Ctrl + Shift + Alt + M (for Meghan)
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'M') {
        toggleMeghanMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMeghanMode]);

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-900 bg-[#faf9f6]">
      {/* Header */}
      <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8 z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            onMouseDown={handleLogoPressStart}
            onMouseUp={handleLogoPressEnd}
            onMouseLeave={handleLogoPressEnd}
            onTouchStart={handleLogoPressStart}
            onTouchEnd={handleLogoPressEnd}
            className="w-10 h-10 rounded-full bg-rose-800 flex items-center justify-center text-white font-serif text-2xl italic cursor-pointer select-none active:scale-95 transition-transform"
          >
            P
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-serif font-bold tracking-tight text-rose-950">Pore Decisions</h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Esthetician Insight Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-stone-100 p-1 rounded-xl overflow-x-auto max-w-[50%] sm:max-w-none no-scrollbar">
          <button 
            onClick={() => setActivePage('cloud')}
            className={`px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activePage === 'cloud' ? 'bg-white text-rose-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
          >
            Cloud
          </button>
          <button 
            onClick={() => setActivePage('trends')}
            className={`px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activePage === 'trends' ? 'bg-white text-rose-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
          >
            Trends
          </button>
          {meghanMode && (
            <>
              <button 
                onClick={() => setActivePage('instagram')}
                className={`px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activePage === 'instagram' ? 'bg-white text-rose-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
              >
                Instagram
              </button>
              <button 
                onClick={() => setActivePage('linkedin')}
                className={`px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activePage === 'linkedin' ? 'bg-white text-blue-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
              >
                LinkedIn
              </button>
              <button 
                onClick={() => setActivePage('tiktok')}
                className={`px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activePage === 'tiktok' ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
              >
                TikTok
              </button>
            </>
          )}
          <button 
            onClick={() => setActivePage('blog')}
            className={`px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activePage === 'blog' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
          >
            Blog
          </button>
          <button 
            onClick={() => setActivePage('connect')}
            className={`px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activePage === 'connect' ? 'bg-white text-rose-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
          >
            Connect
          </button>
        </nav>

        <div className="hidden lg:flex gap-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">
          {meghanMode && <span className="text-rose-800 animate-pulse">Admin Mode Active</span>}
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Hub Ready</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden flex-col">
        <div className="flex-1 overflow-hidden flex flex-row">
          {activePage === 'cloud' && (
            <>
              {/* Left Side: Interactive Mind Map */}
              <div className="flex-1 relative">
                <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-stone-200 shadow-sm pointer-events-none">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Instructions</p>
                  <ul className="text-xs text-stone-600 space-y-1">
                    <li>• Drag nodes to reorganize</li>
                    <li>• Use scroll to zoom in/out</li>
                    <li>• Click a node for AI insights</li>
                  </ul>
                </div>
                <MindMap 
                  data={data} 
                  onNodeClick={handleNodeClick} 
                  selectedNodeId={selectedNode?.id}
                />
                
                {/* Floating Category Legend */}
                <div className="absolute bottom-6 left-6 z-10 flex flex-wrap gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-xl hidden sm:flex">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#881337]"></div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-600">Treatments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1e3a8a]"></div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-600">Business</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#065f46]"></div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-600">Science</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Information Panel */}
              <aside className="hidden md:flex w-96 bg-white border-l border-stone-200 shadow-2xl flex-col z-20 transition-all duration-300">
                {selectedNode ? (
                  <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="mb-8">
                      <span className="inline-block px-2 py-1 rounded bg-stone-100 text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">
                        {selectedNode.category}
                      </span>
                      <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4 leading-tight">
                        {selectedNode.label}
                      </h2>
                      
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                          <div className="w-6 h-6 border-2 border-rose-800/20 border-t-rose-800 rounded-full animate-spin"></div>
                          <p className="text-stone-400 text-xs italic font-serif">Consulting data...</p>
                        </div>
                      ) : error ? (
                        <div className="p-4 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-100">
                          {error}
                        </div>
                      ) : insights ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                          <section>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Context</h3>
                            <p className="text-stone-600 leading-relaxed text-sm italic font-serif bg-stone-50 p-4 rounded-xl border border-stone-100">
                              "{insights.summary}"
                            </p>
                          </section>
                          <section>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Trends</h3>
                            <ul className="space-y-2">
                              {insights.marketTrends.map((trend, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-stone-600 font-medium">
                                  <div className="w-1 h-1 rounded-full bg-rose-800 mt-1.5"></div>
                                  {trend}
                                </li>
                              ))}
                            </ul>
                          </section>
                        </div>
                      ) : (
                        <p className="text-stone-400 text-sm">Select a node to discover more</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-stone-50/50">
                    <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-stone-800">Industry Explorer</h3>
                    <p className="text-xs text-stone-500 leading-relaxed mt-2">
                      Interact with the cloud to uncover deeper industry insights.
                    </p>
                  </div>
                )}
              </aside>
            </>
          )}
          
          {activePage === 'instagram' && <SentimentAnalyzer meghanMode={meghanMode} />}
          {activePage === 'linkedin' && <LinkedInSentimentAnalyzer meghanMode={meghanMode} />}
          {activePage === 'tiktok' && <TikTokSentimentAnalyzer meghanMode={meghanMode} />}
          {activePage === 'trends' && <IndustryTrends meghanMode={meghanMode} />}
          {activePage === 'blog' && <Blog meghanMode={meghanMode} />}
          {activePage === 'connect' && <Connect />}
        </div>

        {/* Global Footer */}
        <footer className="bg-white border-t border-stone-200 px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-40">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900">
              Meghan — Your Esthetician Resource
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            {meghanMode && (
              <>
                <a href="#" className="group flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-rose-800 transition-colors">Instagram</span>
                  <div className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:border-rose-200 group-hover:text-rose-800 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </div>
                </a>
                <a href="#" className="group flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-[#0a66c2] transition-colors">LinkedIn</span>
                  <div className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:border-blue-200 group-hover:text-[#0a66c2] transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  </div>
                </a>
                <a href="#" className="group flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-[#ff0050] transition-colors">TikTok</span>
                  <div className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:border-rose-200 group-hover:text-[#ff0050] transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6-6c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                  </div>
                </a>
              </>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
