"use client";

import {
  createElement,
  useEffect,
  useRef,
  type ElementType,
  type HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { useInlineEdit } from "@/components/inline-edit/inline-edit-provider";

type EditableTextProps = {
  contentKey: string;
  defaultValue: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "contentEditable">;

export function EditableText({
  contentKey,
  defaultValue,
  as: Tag = "span",
  className,
  multiline = false,
  ...rest
}: EditableTextProps) {
  const ctx = useInlineEdit();
  const editableRef = useRef<HTMLElement>(null);

  const displayText = ctx ? ctx.getText(contentKey, defaultValue) : defaultValue;
  const draftText = ctx ? ctx.getDraft(contentKey, defaultValue) : defaultValue;

  useEffect(() => {
    if (!ctx?.editMode || multiline || !editableRef.current) return;
    if (editableRef.current.textContent !== draftText) {
      editableRef.current.textContent = draftText;
    }
  }, [ctx?.editMode, draftText, multiline]);

  if (!ctx?.canEdit || !ctx.editMode) {
    return createElement(Tag, { className, ...rest }, displayText);
  }

  if (multiline) {
    return (
      <textarea
        value={draftText}
        rows={Math.max(2, Math.min(8, draftText.split("\n").length + 1))}
        onChange={(e) => ctx.setDraft(contentKey, e.target.value, defaultValue)}
        className={cn(
          className,
          "w-full resize-y rounded-lg border-2 border-amber-400 bg-amber-50/80 px-3 py-2 text-inherit shadow-sm ring-2 ring-amber-200/60 focus:outline-none focus:ring-amber-400"
        )}
      />
    );
  }

  return createElement(
    Tag,
    {
      ref: editableRef,
      contentEditable: true,
      suppressContentEditableWarning: true,
      className: cn(
        className,
        "rounded-md border-2 border-dashed border-amber-400 bg-amber-50/70 px-1 shadow-sm outline-none ring-2 ring-amber-200/50 focus:border-amber-500 focus:ring-amber-300"
      ),
      onInput: (e: React.FormEvent<HTMLElement>) => {
        ctx.setDraft(contentKey, e.currentTarget.textContent ?? "", defaultValue);
      },
      ...rest,
    },
    draftText
  );
}
