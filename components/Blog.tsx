
import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { supabase } from './services/supabase';

interface BlogPost {
  id: number;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
}

interface BlogProps {
  meghanMode?: boolean;
}

const Blog: React.FC<BlogProps> = ({ meghanMode }) => {
  const defaultPosts: BlogPost[] = [
    {
      id: 1,
      title: "The Rise of Skin Barrier Health in 2025",
      date: "May 12, 2024",
      category: "Science",
      excerpt: "Why 'less is more' is becoming the mantra for modern skincare routines and how estheticians can lead the shift away from over-exfoliation.",
      content: "For years, the industry was obsessed with clinical-strength actives and aggressive peeling. However, 2024 marked a turning point toward barrier restoration. We're seeing a massive influx of ceramides, fatty acids, and microbiome-friendly formulations that prioritize the skin's natural defense system. As professionals, our role is shifting from 'skin-strippers' to 'skin-architects'...",
      imageUrl: "https://picsum.photos/seed/barrier/800/400"
    },
    {
      id: 2,
      title: "Integrating AI into Your Esthetician Practice",
      date: "June 05, 2024",
      category: "Business",
      excerpt: "From skin analysis apps to automated booking systems, explore how technology is enhancing the human touch in the treatment room.",
      content: "Artificial Intelligence isn't here to replace the esthetician; it's here to empower them. High-fidelity skin scanning technology can now detect underlying sun damage and dehydration before it's visible to the naked eye. By integrating these tools, we provide data-driven consultations that build deep trust and show measurable results to our clients...",
      imageUrl: "https://picsum.photos/seed/ai/800/400"
    }
  ];

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'Science',
    excerpt: '',
    content: '',
    imageUrl: ''
  });
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [saveError, setSaveError] = useState('');
  const [heroFileError, setHeroFileError] = useState('');
  const [modalFileError, setModalFileError] = useState('');
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingBody, setIsUploadingBody] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      if (supabase) {
        const { data, error } = await supabase.from('blog_posts').select('*').order('id', { ascending: false });
        if (data && !error && data.length > 0) {
          setPosts(data);
          return;
        }
      }
      const cached = localStorage.getItem('meghan_blog_posts');
      if (cached) {
        setPosts(JSON.parse(cached));
      } else {
        setPosts(defaultPosts);
      }
    };
    fetchPosts();
  }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    const post: BlogPost = {
      ...newPost,
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
    };
    
    if (supabase) {
      const { error } = await supabase.from('blog_posts').insert([post]);
      if (error) {
        console.error("Supabase DB Error:", error);
        setSaveError(`Database error: ${error.message || 'Unknown error'}`);
        return;
      }
    } else {
      try {
        const updatedPosts = [post, ...posts];
        localStorage.setItem('meghan_blog_posts', JSON.stringify(updatedPosts));
      } catch (err) {
        console.error(err);
        setSaveError("Storage limit reached! Local storage can only hold a few MBs of images/videos. Please use smaller files, delete older posts, or use URLs instead.");
        return;
      }
    }
    
    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    setIsAdding(false);
    setNewPost({ title: '', category: 'Science', excerpt: '', content: '', imageUrl: '' });
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 4 * 1024 * 1024;
    const maxSizeLabel = isVideo ? '50MB' : '4MB';

    if (file.size > maxSize) {
       setHeroFileError(`File too large (max ${maxSizeLabel}).`);
       return;
    }
    setHeroFileError('');
    setIsUploadingHero(true);
    
    if (supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('blog-media').upload(fileName, file);
      if (error) {
        console.error("Supabase upload error:", error);
        setHeroFileError(`Upload failed: ${error.message}`);
        setIsUploadingHero(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('blog-media').getPublicUrl(fileName);
      setNewPost(prev => ({ ...prev, imageUrl: publicUrl }));
      setIsUploadingHero(false);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost(prev => ({ ...prev, imageUrl: reader.result as string }));
        setIsUploadingHero(false);
      };
      reader.onerror = () => {
        setHeroFileError("Failed to read local file.");
        setIsUploadingHero(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBodyFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 4 * 1024 * 1024;
    const maxSizeLabel = isVideo ? '50MB' : '4MB';

    if (file.size > maxSize) {
       setModalFileError(`File too large (max ${maxSizeLabel}).`);
       return;
    }
    setModalFileError('');
    setIsUploadingBody(true);
    
    if (supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('blog-media').upload(fileName, file);
      if (error) {
        console.error("Supabase upload error:", error);
        setModalFileError(`Upload failed: ${error.message}`);
        setIsUploadingBody(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('blog-media').getPublicUrl(fileName);
      setTempImageUrl(publicUrl);
      setIsUploadingBody(false);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageUrl(reader.result as string);
        setIsUploadingBody(false);
      };
      reader.onerror = () => {
        setModalFileError("Failed to read local file.");
        setIsUploadingBody(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePost = (id: number) => {
    setPostToDelete(id);
  };

  const confirmDelete = async () => {
    if (postToDelete !== null) {
      if (supabase) {
        await supabase.from('blog_posts').delete().eq('id', postToDelete);
      } else {
        const updatedPosts = posts.filter(p => p.id !== postToDelete);
        localStorage.setItem('meghan_blog_posts', JSON.stringify(updatedPosts));
      }
      setPosts(posts.filter(p => p.id !== postToDelete));
      setPostToDelete(null);
    }
  };

  const handleInsertImage = () => {
    setShowImagePrompt(true);
  };

  const confirmInsertImage = () => {
    if (!tempImageUrl) {
      setShowImagePrompt(false);
      return;
    }
    
    const imageMarkdown = `\n\n![Image description](${tempImageUrl})\n\n`;
    
    if (contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      const currentContent = newPost.content;
      
      const updatedContent = currentContent.substring(0, start) + imageMarkdown + currentContent.substring(end);
      setNewPost({ ...newPost, content: updatedContent });
      
      // Reset focus
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.focus();
          contentRef.current.selectionStart = start + imageMarkdown.length;
          contentRef.current.selectionEnd = start + imageMarkdown.length;
        }
      }, 0);
    } else {
      setNewPost({ ...newPost, content: newPost.content + imageMarkdown });
    }
    
    setTempImageUrl('');
    setShowImagePrompt(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#faf9f6] p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center relative">
          <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">Industry Insights by Meghan</h2>
          <p className="text-stone-500 max-w-lg mx-auto italic font-serif">Curated thoughts for the modern skincare professional.</p>
          
          {meghanMode && (
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="mt-6 px-6 py-2 bg-rose-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-rose-900 transition-all shadow-lg"
            >
              {isAdding ? 'Cancel' : 'Add New Entry'}
            </button>
          )}
        </header>

        {isAdding && meghanMode && (
          <div className="mb-16 bg-white p-8 rounded-3xl border border-stone-200 shadow-xl animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">New Blog Entry</h3>
            {saveError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 text-sm">
                {saveError}
              </div>
            )}
            <form onSubmit={handleAddPost} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Title</label>
                  <input 
                    required
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                    className="w-full bg-stone-50 border-stone-100 border p-3 rounded-xl focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 outline-none transition-all font-serif italic"
                    placeholder="Entry Title"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Category</label>
                  <select 
                    value={newPost.category}
                    onChange={e => setNewPost({...newPost, category: e.target.value})}
                    className="w-full bg-stone-50 border-stone-100 border p-3 rounded-xl focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 outline-none transition-all font-serif italic"
                  >
                    <option>Science</option>
                    <option>Business</option>
                    <option>Treatments</option>
                    <option>Wellness</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Excerpt</label>
                  <input 
                    required
                    value={newPost.excerpt}
                    onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
                    className="w-full bg-stone-50 border-stone-100 border p-3 rounded-xl focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 outline-none transition-all font-serif italic"
                    placeholder="Short summary..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Hero Media (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      value={newPost.imageUrl}
                      onChange={e => setNewPost({...newPost, imageUrl: e.target.value})}
                      className="flex-1 bg-stone-50 border-stone-100 border p-3 rounded-xl focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 outline-none transition-all font-serif italic"
                      placeholder="https://... or upload ->"
                    />
                    <label className={`cursor-pointer bg-stone-100 border border-stone-200 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center justify-center transition-colors ${isUploadingHero ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-200 hover:text-stone-800'}`}>
                      {isUploadingHero ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*,video/*" className="hidden" onChange={handleHeroFileUpload} disabled={isUploadingHero} />
                    </label>
                  </div>
                  {heroFileError && <p className="text-xs text-red-500 font-bold mt-1">{heroFileError}</p>}
                  {newPost.imageUrl && !isUploadingHero && (
                    <p className="text-xs text-emerald-600 font-bold mt-1">✓ Media attached successfully</p>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Content</label>
                  <button 
                    type="button"
                    onClick={handleInsertImage}
                    className="text-[10px] font-bold uppercase tracking-widest text-rose-800 hover:text-rose-900 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    Insert Media into Body
                  </button>
                </div>
                <textarea 
                  ref={contentRef}
                  required
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                  className="w-full bg-stone-50 border-stone-100 border p-3 rounded-xl focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 outline-none transition-all font-serif italic min-h-[200px] resize-none"
                  placeholder="Write your thoughts here... (Markdown is supported for formatting and images!)"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg"
              >
                Publish Entry
              </button>
            </form>
          </div>
        )}

        <div className="space-y-16">
          {posts.map((post) => (
            <article key={post.id} className="group relative">
              {meghanMode && (
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-800 hover:border-rose-200 shadow-sm transition-all z-10"
                  title="Delete Post"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              )}
              
              <div className="flex items-center gap-4 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-800 bg-rose-50 px-2 py-1 rounded">
                  {post.category}
                </span>
                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">{post.date}</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-4 group-hover:text-rose-900 transition-colors">
                {post.title}
              </h3>

              {post.imageUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                  {post.imageUrl.startsWith('data:video/') || post.imageUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <video src={post.imageUrl} controls className="w-full h-auto object-cover max-h-[400px]" />
                  ) : (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-auto object-cover max-h-[400px]"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              )}

              <p className="text-stone-600 leading-relaxed mb-6 font-serif italic text-lg border-l-2 border-stone-200 pl-6">
                {post.excerpt}
              </p>
              <div className="text-stone-800 leading-relaxed space-y-4 markdown-body">
                <Markdown
                  components={{
                    img: ({node, src, alt, ...props}) => {
                      if (src?.startsWith('data:video/') || src?.match(/\.(mp4|webm|ogg|mov)$/i)) {
                        return <video src={src} controls className="rounded-xl shadow-sm my-4 max-h-[400px] w-full object-cover" />;
                      }
                      return <img src={src} alt={alt} {...props} className="rounded-xl shadow-sm my-4 max-h-[400px] object-cover" referrerPolicy="no-referrer" />;
                    },
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    a: ({node, ...props}) => <a className="text-rose-800 underline hover:text-rose-900" {...props} />
                  }}
                >
                  {post.content}
                </Markdown>
              </div>
              <div className="mt-8 pt-8 border-t border-stone-100 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-rose-800 transition-colors">
                Read Full Entry 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Custom Image Prompt Modal */}
      {showImagePrompt && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Insert Media</h3>
            <p className="text-stone-500 text-sm mb-6">Paste a URL or upload a file from your device.</p>
            
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                value={tempImageUrl}
                onChange={e => setTempImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-stone-50 border-stone-200 border p-3 rounded-xl focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 outline-none transition-all font-serif italic"
                autoFocus
              />
              
              <div className="flex items-center gap-4">
                <div className="h-px bg-stone-200 flex-1"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">OR</span>
                <div className="h-px bg-stone-200 flex-1"></div>
              </div>

              <label className={`cursor-pointer w-full bg-stone-50 border-2 border-dashed border-stone-200 p-4 rounded-xl text-center transition-colors ${isUploadingBody ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-100 hover:border-rose-300'}`}>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  {isUploadingBody ? 'Uploading Media...' : 'Browse Local Files'}
                </span>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleBodyFileUpload} disabled={isUploadingBody} />
              </label>
              {modalFileError && <p className="text-xs text-red-500 font-bold">{modalFileError}</p>}
              {tempImageUrl && !isUploadingBody && (
                <p className="text-xs text-emerald-600 font-bold">✓ Media selected successfully</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setShowImagePrompt(false); setTempImageUrl(''); setModalFileError(''); }} 
                className="px-6 py-3 text-stone-500 text-[10px] font-bold uppercase tracking-widest hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmInsertImage} 
                className="px-6 py-3 bg-rose-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-rose-900 shadow-md transition-colors"
              >
                Insert Media
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {postToDelete !== null && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-800 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-3">Delete Entry?</h3>
            <p className="text-stone-500 text-sm mb-8 leading-relaxed">Are you sure you want to delete this blog post? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setPostToDelete(null)} 
                className="px-6 py-3 text-stone-500 text-[10px] font-bold uppercase tracking-widest hover:text-stone-800 bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-6 py-3 bg-rose-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-rose-900 shadow-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
