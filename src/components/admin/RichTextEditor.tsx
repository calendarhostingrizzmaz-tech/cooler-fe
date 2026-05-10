import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

const ToolbarButton = ({ onClick, active, disabled, title, children }: ToolbarButtonProps) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-sm font-semibold transition-colors
      ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white text-gray-700 hover:bg-gray-100'
      }
      ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
    `}
  >
    {children}
  </button>
);

const Divider = () => <div className="mx-1 h-5 w-px bg-gray-200" />;

const RichTextEditor = ({ value, onChange, placeholder = 'Product description…' }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: {},
        orderedList: {},
        bold: {},
        italic: {},
        strike: {},
        code: {},
        blockquote: {},
        horizontalRule: {},
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] px-3 py-2.5 text-sm text-gray-800 focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-gray-50 px-2 py-1.5">

        {/* Headings */}
        <ToolbarButton
          title="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        >
          H3
        </ToolbarButton>

        <Divider />

        {/* Text styles */}
        <ToolbarButton
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          • —
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          1.—
        </ToolbarButton>

        <Divider />

        {/* Blockquote */}
        <ToolbarButton
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        >
          ❝
        </ToolbarButton>

        {/* Horizontal rule */}
        <ToolbarButton
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          —
        </ToolbarButton>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          ↪
        </ToolbarButton>

        <Divider />

        {/* Clear formatting */}
        <ToolbarButton
          title="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          ✕
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Styles for editor content */}
      <style>{`
        .tiptap h1 { font-size: 1.35rem; font-weight: 800; margin: 0.4rem 0; color: #111; }
        .tiptap h2 { font-size: 1.15rem; font-weight: 700; margin: 0.35rem 0; color: #222; }
        .tiptap h3 { font-size: 1rem;    font-weight: 700; margin: 0.3rem 0;  color: #333; }
        .tiptap p  { margin: 0.25rem 0; }
        .tiptap ul { list-style: disc;    padding-left: 1.25rem; margin: 0.25rem 0; }
        .tiptap ol { list-style: decimal; padding-left: 1.25rem; margin: 0.25rem 0; }
        .tiptap blockquote { border-left: 3px solid #2563eb; padding-left: 0.75rem; color: #555; margin: 0.35rem 0; }
        .tiptap hr { border: none; border-top: 1px solid #e5e7eb; margin: 0.5rem 0; }
        .tiptap code { background: #f1f5f9; border-radius: 4px; padding: 1px 5px; font-size: 0.85em; }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
