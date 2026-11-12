import { useEffect, useId, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Pilcrow,
} from "lucide-react";
import { sanitizeRichText } from "../utils/richText";

const sizeOptions = [
  { label: "12 px", value: "1" },
  { label: "14 px", value: "2" },
  { label: "16 px", value: "3" },
  { label: "18 px", value: "4" },
  { label: "24 px", value: "5" },
  { label: "28 px", value: "6" },
  { label: "32 px", value: "7" },
];

export default function RichTextEditor({ value, onChange, label = "Rich text content" }) {
  const editorId = useId().replace(/:/g, "");
  const editorRef = useRef(null);
  const savedRange = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const clean = sanitizeRichText(value || "");
    if (editorRef.current.innerHTML !== clean) {
      editorRef.current.innerHTML = clean;
    }
  }, [value]);

  const saveSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRange.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor || !savedRange.current || !editor.contains(savedRange.current.commonAncestorContainer)) {
      editor?.focus();
      return;
    }
    editor.focus();
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange.current);
  };

  const syncValue = () => {
    const clean = sanitizeRichText(editorRef.current?.innerHTML || "");
    onChange(clean);
  };

  const applyCommand = (command, argument) => {
    restoreSelection();
    document.execCommand(command, false, argument);
    const clean = sanitizeRichText(editorRef.current?.innerHTML || "");
    editorRef.current.innerHTML = clean;
    savedRange.current = null;
    onChange(clean);
    editorRef.current.focus();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const plainText = event.clipboardData?.getData("text/plain") || "";
    document.execCommand("insertText", false, plainText);
    syncValue();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 p-2">
        <button
          type="button"
          title="Bold"
          aria-label="Bold"
          onMouseDown={(event) => { event.preventDefault(); saveSelection(); }}
          onClick={() => applyCommand("bold")}
          className="rich-editor-tool"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          title="Italic"
          aria-label="Italic"
          onMouseDown={(event) => { event.preventDefault(); saveSelection(); }}
          onClick={() => applyCommand("italic")}
          className="rich-editor-tool"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          title="Underline"
          aria-label="Underline"
          onMouseDown={(event) => { event.preventDefault(); saveSelection(); }}
          onClick={() => applyCommand("underline")}
          className="rich-editor-tool"
        >
          <Underline size={16} />
        </button>

        <span className="mx-1 h-6 w-px bg-white/15" />

        <label className="sr-only" htmlFor={`${editorId}-font-size`}>Text size</label>
        <select
          id={`${editorId}-font-size`}
          defaultValue="3"
          onMouseDown={saveSelection}
          onChange={(event) => applyCommand("fontSize", event.target.value)}
          className="rich-editor-select"
        >
          {sizeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor={`${editorId}-block-format`}>Paragraph style</label>
        <select
          id={`${editorId}-block-format`}
          defaultValue="p"
          onMouseDown={saveSelection}
          onChange={(event) => applyCommand("formatBlock", "<" + event.target.value + ">")}
          className="rich-editor-select"
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
          <option value="blockquote">Quote</option>
        </select>

        <span className="mx-1 h-6 w-px bg-white/15" />

        <button
          type="button"
          title="Bulleted list"
          aria-label="Bulleted list"
          onMouseDown={(event) => { event.preventDefault(); saveSelection(); }}
          onClick={() => applyCommand("insertUnorderedList")}
          className="rich-editor-tool"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          title="Numbered list"
          aria-label="Numbered list"
          onMouseDown={(event) => { event.preventDefault(); saveSelection(); }}
          onClick={() => applyCommand("insertOrderedList")}
          className="rich-editor-tool"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          title="Normal paragraph"
          aria-label="Normal paragraph"
          onMouseDown={(event) => { event.preventDefault(); saveSelection(); }}
          onClick={() => applyCommand("formatBlock", "<p>")}
          className="rich-editor-tool"
        >
          <Pilcrow size={16} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={label}
        aria-multiline="true"
        data-placeholder={`Write ${label.toLowerCase()} here. Select text to format it...`}
        className="rich-editor-surface"
        onInput={syncValue}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onBlur={saveSelection}
        onPaste={handlePaste}
      />
      <div className="border-t border-white/10 px-3 py-2 text-xs text-white/40">
        Select text before applying formatting. Pasted content is inserted as plain text.
      </div>
    </div>
  );
}
