"use client";

import { useEffect, useId, useState } from "react";
import styles from "./chatHelper.module.css";

import { promptApi } from "@/api/prompt/PromptApi";
import { noteApi } from "@/api/note/noteApi"; // 가정: getAllTitle()이 있다고 봄

type Option = { id: string; title: string };

export type ChatHelperValue = {
  noteId: string | null;
  promptId: string | null;
};

type ChatHelperProps = {
  /** 현재 저장된 선택값 (모달을 열 때 초기 선택으로 사용) */
  initial?: Partial<ChatHelperValue>;
  onSubmit: (value: ChatHelperValue) => void | Promise<void>;
  onClose: () => void;
};

const NONE = "";

function ChatHelper({ initial, onSubmit, onClose }: ChatHelperProps) {
  const noteSelectId = useId();
  const promptSelectId = useId();

  const [notes, setNotes] = useState<Option[]>([]);
  const [prompts, setPrompts] = useState<Option[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const [noteId, setNoteId] = useState<string>(initial?.noteId ?? NONE);
  const [promptId, setPromptId] = useState<string>(initial?.promptId ?? NONE);

  // 모달이 열릴 때마다(= 마운트될 때마다) 최신 목록을 불러옴
  // Modal이 isOpen=false면 children을 렌더하지 않으므로 열 때마다 새로 마운트됨
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadFailed(false);

      try {
        const [noteList, promptList] = await Promise.all([
          noteApi.getAll(),
          promptApi.getAllTitle(),
        ]);
        if (cancelled) return;

        setNotes(noteList.map(({ id, title }) => ({ id, title })));
        setPrompts(promptList.map(({ id, title }) => ({ id, title })));
      } catch (error) {
        console.error("노트/프롬프트 목록 조회 실패:", error);
        if (!cancelled) setLoadFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // 저장된 id가 목록에 없으면(삭제됨 등) NONE으로 표시
  const safeNoteId = notes.some((n) => n.id === noteId) ? noteId : NONE;
  const safePromptId = prompts.some((p) => p.id === promptId) ? promptId : NONE;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({
        noteId: safeNoteId === NONE ? null : safeNoteId,
        promptId: safePromptId === NONE ? null : safePromptId,
      });
      onClose();
    } catch (error) {
      console.error("노트/프롬프트 적용 실패:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>노트 · 프롬프트 선택</h2>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
      </header>

      <p className={styles.description}>
        이 채팅에 적용할 노트와 프롬프트를 선택해주세요.
      </p>

      <div className={styles.selectionArea}>
        <div className={styles.formGroup}>
          <label htmlFor={noteSelectId}>노트</label>
          <select
            id={noteSelectId}
            value={safeNoteId}
            onChange={(e) => setNoteId(e.target.value)}
            disabled={isLoading || isSaving}
          >
            <option value={NONE}>NONE</option>
            {notes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title || "(제목 없음)"}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor={promptSelectId}>프롬프트</label>
          <select
            id={promptSelectId}
            value={safePromptId}
            onChange={(e) => setPromptId(e.target.value)}
            disabled={isLoading || isSaving}
          >
            <option value={NONE}>NONE</option>
            {prompts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || "(제목 없음)"}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <p className={styles.status}>목록을 불러오는 중...</p>}
        {loadFailed && (
          <p className={styles.error}>목록을 불러오지 못했어요. 다시 열어주세요.</p>
        )}
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={`${styles.button} ${styles.cancelButton}`}
          onClick={onClose}
          disabled={isSaving}
        >
          취소
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.addButton}`}
          onClick={handleSubmit}
          disabled={isLoading || loadFailed || isSaving}
        >
          {isSaving ? "저장 중..." : "적용"}
        </button>
      </footer>
    </div>
  );
}

export default ChatHelper;