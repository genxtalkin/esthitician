
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle, FontSize, FontFamily, Color } from '@tiptap/extension-text-style';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { supabase } from './services/supabase';

const FONTS = [
  { label: 'Default', value: '' },
  { label: 'Inter (Sans)', value: 'Inter, sans-serif' },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Courier New', value: "'Courier New', monospace" },
];

const SIZES = ['10px','11px','12px','13px','14px','16px','18px','20px','22px','24px','28px','32px','36px','48px'];

const COLORS = [
  '#1c1917','#7c2d12','#9f1239','#1d4ed8','#15803d',
  '#a16207','#6b21a8','#0f766e','#78716c','#ffffff',
];

// --- SVG Icons ---
const Icon = ({ d, d2 }: { d?: string; d2?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d && <path d={d} />}{d2 && <path d={d2} />}
  </svg>
);
const BoldIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const ItalicIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const UnderlineIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>;
const StrikeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="12" x2="6" y2="12"/><path d="M13 5c-.5-1-1.5-2-3-2C7.5 3 6 5 6 7c0 3 2 4 6 5"/><path d="M11 19c.5 1 1.5 2 3 2 2.5 0 4-2 4-4 0-3-2-4-6-5"/></svg>;
const UndoIcon = () => <Icon d="M3 7v6h6" d2="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />;
const RedoIcon = () => <Icon d="M21 7v6h-6" d2="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />;
const BulletIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>;
const OrderedIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>;
const AlignLeftIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;
const AlignCenterIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>;
const AlignRightIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>;
const LinkIcon = () => <Icon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" d2="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />;
const ImageIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const Sep = () => <div className="w-px h-5 bg-stone-200 mx-0.5 self-center flex-shrink-0" />;

interface TBtn {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}
const TBtn = ({ onClick, active, disabled, title, children }: TBtn) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded transition-colors flex-shrink-0 ${
      active ? 'bg-rose-800 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
);

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImgModal, setShowImgModal] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [imgError, setImgError] = useState('');
  const [imgUploading, setImgUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      Color,
      FontFamily,
      TiptapImage.configure({ allowBase64: true, HTMLAttributes: { class: 'blog-img' } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'blog-link' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'tiptap-edit', 'data-placeholder': placeholder || 'Write your post here...' },
    },
  });

  // Clear when parent resets value to empty
  useEffect(() => {
    if (editor && value === '' && editor.getText().trim() !== '') {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setImgError('File too large (max 4MB).'); return; }
    setImgError('');
    setImgUploading(true);
    if (supabase) {
      const ext = file.name.split('.').pop();
      const name = `${Math.random().toString(36).substring(2)}.${ext}`;
      const { error } = await supabase.storage.from('blog-media').upload(name, file);
      if (error) { setImgError(`Upload failed: ${error.message}`); setImgUploading(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('blog-media').getPublicUrl(name);
      setImgUrl(publicUrl);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => { setImgUrl(reader.result as string); setImgUploading(false); };
      reader.onerror = () => { setImgError('Failed to read file.'); setImgUploading(false); };
      reader.readAsDataURL(file);
      return;
    }
    setImgUploading(false);
  };

  const insertImage = () => {
    if (!imgUrl || !editor) return;
    editor.chain().focus().setImage({ src: imgUrl }).run();
    setImgUrl(''); setShowImgModal(false); setImgError('');
  };

  const insertLink = () => {
    if (!editor) return;
    if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run();
    else editor.chain().focus().unsetLink().run();
    setLinkUrl(''); setShowLink(false);
  };

  if (!editor) return null;

  const fontSize = editor.getAttributes('textStyle').fontSize || '16px';
  const fontFamily = editor.getAttributes('textStyle').fontFamily || '';

  return (
    <div className="border border-stone-200 rounded-xl overflow-visible focus-within:border-rose-800 focus-within:ring-2 focus-within:ring-rose-800/10 transition-all">
      {/* ── Toolbar ── */}
      <div className="bg-stone-50 border-b border-stone-200 p-2 flex flex-wrap gap-0.5 items-center">
        {/* Undo / Redo */}
        <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><UndoIcon /></TBtn>
        <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><RedoIcon /></TBtn>
        <Sep />

        {/* Font family */}
        <select
          value={fontFamily}
          onMouseDown={e => e.stopPropagation()}
          onChange={e => e.target.value
            ? editor.chain().focus().setFontFamily(e.target.value).run()
            : editor.chain().focus().unsetFontFamily().run()
          }
          className="text-xs border border-stone-200 rounded px-2 py-1 bg-white text-stone-700 focus:outline-none focus:border-rose-800 cursor-pointer max-w-[130px]"
        >
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* Font size */}
        <select
          value={fontSize}
          onMouseDown={e => e.stopPropagation()}
          onChange={e => (editor.chain().focus() as any).setFontSize(e.target.value).run()}
          className="text-xs border border-stone-200 rounded px-2 py-1 bg-white text-stone-700 focus:outline-none focus:border-rose-800 cursor-pointer w-20"
        >
          {SIZES.map(s => <option key={s} value={s}>{s.replace('px', '')}</option>)}
        </select>
        <Sep />

        {/* Inline formatting */}
        <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><BoldIcon /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><ItalicIcon /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><StrikeIcon /></TBtn>
        <Sep />

        {/* Headings */}
        {([1,2,3] as const).map(level => (
          <TBtn key={level} onClick={() => editor.chain().focus().toggleHeading({ level }).run()} active={editor.isActive('heading', { level })} title={`Heading ${level}`}>
            <span className="text-[11px] font-bold">H{level}</span>
          </TBtn>
        ))}
        <Sep />

        {/* Lists */}
        <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><BulletIcon /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><OrderedIcon /></TBtn>
        <Sep />

        {/* Alignment */}
        <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left"><AlignLeftIcon /></TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center"><AlignCenterIcon /></TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right"><AlignRightIcon /></TBtn>
        <Sep />

        {/* Color swatches */}
        <div className="flex items-center gap-0.5">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              title={c}
              onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
              className="w-4 h-4 rounded-full border border-stone-300 hover:scale-125 transition-transform cursor-pointer"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <Sep />

        {/* Link */}
        <div className="relative">
          <TBtn onClick={() => { setShowLink(!showLink); setLinkUrl(editor.getAttributes('link').href || ''); }} active={editor.isActive('link')} title="Link"><LinkIcon /></TBtn>
          {showLink && (
            <div className="absolute top-9 left-0 z-30 bg-white border border-stone-200 rounded-xl shadow-xl p-3 flex gap-2 min-w-[260px]">
              <input
                type="url"
                value={linkUrl}
                autoFocus
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-rose-800"
                onKeyDown={e => { if (e.key === 'Enter') insertLink(); if (e.key === 'Escape') setShowLink(false); }}
              />
              <button type="button" onClick={insertLink} className="text-xs bg-rose-800 text-white px-3 py-1 rounded-lg hover:bg-rose-900">Add</button>
              {editor.isActive('link') && (
                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLink(false); }} className="text-xs bg-stone-200 text-stone-700 px-2 py-1 rounded-lg hover:bg-stone-300">Remove</button>
              )}
            </div>
          )}
        </div>

        {/* Image */}
        <TBtn onClick={() => { setShowImgModal(true); setImgUrl(''); setImgError(''); }} title="Insert image"><ImageIcon /></TBtn>
      </div>

      {/* ── Editor Area ── */}
      <div className="bg-white p-4 min-h-[220px]">
        <EditorContent editor={editor} />
      </div>

      {/* ── Image Modal ── */}
      {showImgModal && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Insert Image</h3>
            <p className="text-stone-500 text-sm mb-6">Paste a URL or upload from your device.</p>
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text" autoFocus value={imgUrl}
                onChange={e => setImgUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl focus:ring-2 focus:ring-rose-800/10 focus:border-rose-800 outline-none transition-all"
              />
              <div className="flex items-center gap-4">
                <div className="h-px bg-stone-200 flex-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">OR</span>
                <div className="h-px bg-stone-200 flex-1" />
              </div>
              <label className={`cursor-pointer w-full bg-stone-50 border-2 border-dashed border-stone-200 p-4 rounded-xl text-center transition-colors ${imgUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-100 hover:border-rose-300'}`}>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  {imgUploading ? 'Uploading...' : 'Browse Local Files'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImgUpload} disabled={imgUploading} />
              </label>
              {imgError && <p className="text-xs text-red-500 font-bold">{imgError}</p>}
              {imgUrl && !imgUploading && <p className="text-xs text-emerald-600 font-bold">✓ Image ready</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowImgModal(false); setImgUrl(''); setImgError(''); }} className="px-6 py-3 text-stone-500 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="button" onClick={insertImage} disabled={!imgUrl || imgUploading} className="px-6 py-3 bg-rose-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-rose-900 shadow-md transition-colors disabled:opacity-50">
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
