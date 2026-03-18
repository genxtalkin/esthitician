
import React, { useState } from 'react';

const Connect: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {submitted ? (
          <div className="text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-800 mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Connection Requested</h2>
            <p className="text-stone-500 font-serif italic">Meghan will be in touch shortly. Thank you for reaching out.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="mt-8 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-rose-800 transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif font-bold text-stone-900 mb-2">Connect With Meghan</h2>
              <p className="text-stone-500 text-sm font-medium uppercase tracking-widest">Esthetician Resource Hub</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-stone-50 border-stone-100 border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 transition-all font-serif italic"
                  placeholder="e.g. Julianne Smith"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Email Address</label>
                <input 
                  required
                  type="email" 
                  className="w-full bg-stone-50 border-stone-100 border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 transition-all font-serif italic"
                  placeholder="name@example.com"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  className="w-full bg-stone-50 border-stone-100 border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 transition-all font-serif italic"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Notes for Meghan</label>
                <textarea 
                  className="w-full bg-stone-50 border-stone-100 border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 transition-all font-serif italic min-h-[120px] resize-none"
                  placeholder="Tell Meghan what you'd like to discuss..."
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-stone-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 active:scale-[0.98]"
              >
                Send Message
              </button>
            </form>
            
            <p className="mt-8 text-[10px] text-center text-stone-400 font-medium leading-relaxed">
              By submitting, you agree to professional correspondence. Your data is handled with clinical care and privacy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Connect;
