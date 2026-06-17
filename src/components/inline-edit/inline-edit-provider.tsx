"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveInlineContentAction } from "@/lib/actions/inline-content";
import { resolveInlineText, type InlineContentMap } from "@/lib/site/inline-content";
import { InlineEditToolbar } from "@/components/inline-edit/inline-edit-toolbar";

type InlineEditContextValue = {
  canEdit: boolean;
  editMode: boolean;
  enterEditMode: () => void;
  exitEditMode: () => void;
  getText: (key: string, defaultValue: string) => string;
  getDraft: (key: string, defaultValue: string) => string;
  setDraft: (key: string, value: string, defaultValue: string) => void;
  dirtyCount: number;
  saving: boolean;
  save: () => Promise<void>;
  cancel: () => void;
};

const InlineEditContext = createContext<InlineEditContextValue | null>(null);

export function useInlineEdit() {
  return useContext(InlineEditContext);
}

export function InlineEditProvider({
  canEdit,
  initialStored,
  children,
}: {
  canEdit: boolean;
  initialStored: InlineContentMap;
  children: ReactNode;
}) {
  const router = useRouter();
  const [stored, setStored] = useState<InlineContentMap>(initialStored);
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<InlineContentMap>({});
  const [saving, setSaving] = useState(false);
  const defaultsRef = useRef<Map<string, string>>(new Map());

  const getText = useCallback(
    (key: string, defaultValue: string) => resolveInlineText(stored, key, defaultValue),
    [stored]
  );

  const getDraft = useCallback(
    (key: string, defaultValue: string) => {
      if (key in drafts) return drafts[key]!;
      return getText(key, defaultValue);
    },
    [drafts, getText]
  );

  const setDraft = useCallback((key: string, value: string, defaultValue: string) => {
    defaultsRef.current.set(key, defaultValue);
    setDrafts((prev) => ({ ...prev, [key]: value }));
  }, []);

  const dirtyKeys = useMemo(() => {
    return Object.entries(drafts).filter(([key, value]) => {
      const defaultValue = defaultsRef.current.get(key) ?? value;
      const baseline = resolveInlineText(stored, key, defaultValue);
      return value !== baseline;
    });
  }, [drafts, stored]);

  const dirtyCount = dirtyKeys.length;

  const enterEditMode = useCallback(() => {
    if (!canEdit) return;
    setEditMode(true);
  }, [canEdit]);

  const exitEditMode = useCallback(() => {
    setEditMode(false);
    setDrafts({});
    defaultsRef.current.clear();
  }, []);

  const cancel = useCallback(() => {
    exitEditMode();
  }, [exitEditMode]);

  const save = useCallback(async () => {
    if (!canEdit || dirtyCount === 0) return;

    const updates = Object.fromEntries(dirtyKeys);
    setSaving(true);
    try {
      const result = await saveInlineContentAction(updates);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      if ("success" in result && result.success) {
        setStored(result.stored);
        setDrafts({});
        setEditMode(false);
        toast.success("Đã lưu nội dung trang");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [canEdit, dirtyCount, dirtyKeys, router]);

  const value = useMemo<InlineEditContextValue>(
    () => ({
      canEdit,
      editMode,
      enterEditMode,
      exitEditMode,
      getText,
      getDraft,
      setDraft,
      dirtyCount,
      saving,
      save,
      cancel,
    }),
    [
      canEdit,
      editMode,
      enterEditMode,
      exitEditMode,
      getText,
      getDraft,
      setDraft,
      dirtyCount,
      saving,
      save,
      cancel,
    ]
  );

  return (
    <InlineEditContext.Provider value={value}>
      <div className={editMode ? "pb-24" : undefined}>{children}</div>
      {canEdit && <InlineEditToolbar />}
    </InlineEditContext.Provider>
  );
}
