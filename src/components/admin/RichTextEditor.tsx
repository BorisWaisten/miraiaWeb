'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Props {
  name: string;
  defaultValue?: string | null;
  onChange?: (html: string) => void;
}

/**
 * Editor de texto enriquecido minimalista para la ficha de producto.
 * Usa Tiptap (headless) con StarterKit: H2, H3, negrita, bullet list, ordered list.
 * Guarda el contenido como HTML limpio en un <textarea hidden> para que el form
 * lo capture vía FormData igual que cualquier otro campo de texto.
 */
export function RichTextEditor({ name, defaultValue, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue ?? '',
    editorProps: {
      attributes: {
        class: 'min-h-[140px] outline-none text-sm text-white leading-relaxed',
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      // Sync al textarea hidden
      const ta = document.getElementById(`rte-hidden-${name}`) as HTMLTextAreaElement | null;
      if (ta) ta.value = html;
      onChange?.(html);
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-graphite-border focus-within:border-bronze">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-graphite-border bg-[#1a1a18] px-2 py-1.5">
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Título (H2)"
        >
          H2
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Subtítulo (H3)"
        >
          H3
        </ToolButton>
        <Separator />
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrita"
        >
          <strong>B</strong>
        </ToolButton>
        <Separator />
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista con viñetas"
        >
          ≡
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          1.
        </ToolButton>
        <Separator />
        <ToolButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph') && !editor.isActive('heading')}
          title="Párrafo"
        >
          ¶
        </ToolButton>
      </div>

      {/* Área editable */}
      <div className="px-4 py-3 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:font-serif [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:text-white [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_h3]:mt-3 [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-white [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_p]:text-graphite-muted [&_.ProseMirror_ul]:mb-2 [&_.ProseMirror_ul]:ml-4 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:text-graphite-muted [&_.ProseMirror_ol]:mb-2 [&_.ProseMirror_ol]:ml-4 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:text-graphite-muted [&_.ProseMirror_strong]:text-white">
        <EditorContent editor={editor} />
      </div>

      {/* Campo hidden que el formulario captura via FormData */}
      <textarea
        id={`rte-hidden-${name}`}
        name={name}
        defaultValue={defaultValue ?? ''}
        hidden
        readOnly
      />
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
        active
          ? 'bg-bronze text-obsidian'
          : 'text-graphite-muted hover:bg-graphite hover:text-bronze'
      }`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span className="mx-1 inline-block h-5 w-px self-center bg-graphite-border" />;
}
