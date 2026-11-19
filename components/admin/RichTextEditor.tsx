"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect, useState } from "react";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value || "");

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && !htmlMode && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
    if (htmlMode) setHtmlValue(value || "");
  }, [value, editor, htmlMode]);

  if (!editor) return null;

  const toggleHtml = () => {
    if (htmlMode) {
      onChange(htmlValue);
      editor.commands.setContent(htmlValue || "");
    } else {
      setHtmlValue(editor.getHTML());
    }
    setHtmlMode(!htmlMode);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {[
          { label: "B", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
          { label: "I", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
          { label: "U", action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline") },
          { label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
          { label: "•", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.action}
            disabled={htmlMode}
            className={`px-2 py-1 rounded text-xs border ${
              b.active ? "bg-thuy-400 text-thuy-950 border-thuy-400" : "bg-thuy-900 text-slate-200 border-thuy-750"
            } ${htmlMode ? "opacity-40" : ""}`}
          >
            {b.label}
          </button>
        ))}
        <button
          type="button"
          onClick={toggleHtml}
          className={`px-2 py-1 rounded text-xs border ${
            htmlMode ? "bg-amber-400 text-thuy-950 border-amber-400" : "bg-thuy-900 text-slate-200 border-thuy-750"
          }`}
        >
          HTML
        </button>
      </div>
      {htmlMode ? (
        <textarea
          rows={12}
          value={htmlValue}
          onChange={(e) => setHtmlValue(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white font-mono leading-relaxed min-h-[200px]"
          placeholder="Dán mã HTML tại đây..."
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}