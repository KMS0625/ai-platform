"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CreatePageDto } from "@/zrc/lib/schemas/page";
import { ArrayToString, parseKeywords } from "@/utils/parseKeywords";
import pageStyles from "@/components/noteWorkspace/Page/pageCard.module.css";
import styles from "./answerPageHelper.module.css";

type PagePreview = { id: string; title: string; content: string };

type AnswerPageHelperProps = {
    content: string;
    pages?: PagePreview[];
    pagesLoading?: boolean;
    pagesError?: string;
    onClose: () => void;
    onSubmit?: (draft: CreatePageDto) => void | Promise<void>;
    disabledReason?: string;
    onGenerateKeywords?: (source: string, signal: AbortSignal) => Promise<string[]>;
};

export default function AnswerPageHelper({ content: answerContent, pages = [], pagesLoading = false, pagesError, onClose, onSubmit, disabledReason, onGenerateKeywords }: AnswerPageHelperProps) {
    const id = useId();
    const formRef = useRef<HTMLFormElement>(null);
    const submittingRef = useRef(false);
    const [title, setTitle] = useState("");
    const [keywords, setKeywords] = useState("");
    const [content, setContent] = useState(answerContent);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [keywordError, setKeywordError] = useState("");
    const keywordRequest = useRef<AbortController | null>(null);

    useEffect(() => () => { keywordRequest.current?.abort(); }, []);

    const generateKeywords = async () => {
        if (!content.trim() || !onGenerateKeywords || submittingRef.current || keywordRequest.current) return;
        const controller = new AbortController();
        keywordRequest.current = controller;
        setIsGenerating(true);
        setKeywordError("");
        setNotice("");
        try {
            const result = await onGenerateKeywords(content, controller.signal);
            if (!controller.signal.aborted) setKeywords(ArrayToString(result));
        } catch {
            if (!controller.signal.aborted) setKeywordError("키워드 자동 생성에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            if (!controller.signal.aborted) {
                keywordRequest.current = null;
                setIsGenerating(false);
            }
        }
    };

    const handleSubmit = async () => {
        if (disabledReason || !title.trim() || !content.trim() || submittingRef.current || keywordRequest.current) return;
        submittingRef.current = true;
        setIsSubmitting(true);
        setNotice("");
        setError("");
        try {
            const draft: CreatePageDto = { title: title.trim(), keywords: parseKeywords(keywords), content };
            if (onSubmit) {
                await onSubmit(draft);
                onClose();
            } else {
                setNotice("페이지 초안이 준비되었습니다.");
            }
        } catch {
            setError("제출하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <form
            ref={formRef}
            className={styles.container}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-heading`}
            aria-describedby={`${id}-description`}
            onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}
            onChange={() => { setNotice(""); setError(""); }}
            onKeyDown={(event) => {
                if (event.key !== "Tab") return;
                const elements = formRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex='0']");
                if (!elements?.length) return;
                const first = elements[0];
                const last = elements[elements.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault(); last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault(); first.focus();
                }
            }}
        >
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>답변에서 페이지로</span>
                    <h2 id={`${id}-heading`} className={styles.heading}>답변으로 페이지 만들기</h2>
                    <p id={`${id}-description`} className={styles.description}>참고 페이지를 살펴보고, 나만의 페이지로 정리해 보세요.</p>
                </div>
                <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">×</button>
            </header>

            <div className={styles.body}>
                <section aria-labelledby={`${id}-pages`} className={styles.previewSection}>
                    <div className={styles.sectionHeader}>
                        <h3 id={`${id}-pages`} className={styles.sectionTitle}>참고 페이지</h3>
                        <span className={styles.hint} role="status">{pagesLoading ? "조회 중…" : `${Math.min(pages.length, 3)} / 3`}</span>
                    </div>
                    <div className={styles.pageCards}>
                        {Array.from({ length: 3 }, (_, index) => {
                            const page = pages[index];
                            return (
                                <article key={page?.id ?? index} className={`${pageStyles.container} ${styles.pageCard}`} aria-label={`참고 페이지 ${index + 1}`}>
                                    <h4 className={`${styles.pageTitle} ${!page ? styles.placeholder : ""}`}>{page ? page.title || "제목 없는 페이지" : pagesLoading ? "조회 중…" : "없는 페이지"}</h4>
                                    <div className={`${styles.pageContent} ${!page ? styles.placeholder : ""}`} tabIndex={page ? 0 : undefined}>
                                        {page ? page.content || "내용이 없습니다." : pagesLoading ? "유사한 페이지를 찾고 있습니다." : "표시할 페이지가 없습니다."}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    {pagesError && <p className={styles.error} role="alert">{pagesError}</p>}
                </section>

                <section className={styles.editor} aria-labelledby={`${id}-draft`}>
                    <h3 id={`${id}-draft`} className={styles.editorTitle}>이 답변을 페이지로 만들까요?</h3>
                    <div className={styles.fields}>
                        <label className={styles.field}>
                            <span>제목 <span className={styles.required}>*</span></span>
                            <input autoFocus required value={title} onChange={event => setTitle(event.target.value)} placeholder="페이지 제목을 입력하세요" disabled={isSubmitting} />
                        </label>
                        <div className={styles.field}>
                            <div className={styles.sectionHeader}>
                                <label htmlFor={`${id}-keywords`}>키워드 <span className={styles.optional}>선택</span></label>
                                <button type="button" className={pageStyles.generateButton}
                                    onClick={generateKeywords}
                                    disabled={!content.trim() || !onGenerateKeywords || isSubmitting || isGenerating}>
                                    {isGenerating ? "생성 중..." : "키워드 자동 생성"}
                                </button>
                            </div>
                            <input id={`${id}-keywords`} value={keywords} onChange={event => setKeywords(event.target.value)} placeholder="쉼표로 구분해 입력하세요" disabled={isSubmitting || isGenerating} />
                            {keywordError && <p className={styles.error} role="alert">{keywordError}</p>}
                        </div>
                    </div>
                    <label className={styles.field}>
                        <span className={styles.sectionHeader}>
                            <span>내용 <span className={styles.required}>*</span></span>
                            <span className={styles.hint}>{content.length.toLocaleString()}자</span>
                        </span>
                        <textarea required rows={7} value={content} onChange={event => setContent(event.target.value)} disabled={isSubmitting || isGenerating} />
                    </label>
                </section>
                {notice && <p className={styles.notice} role="status">{notice}</p>}
                {disabledReason && <p className={styles.notice} role="status">{disabledReason}</p>}
                {error && <p className={styles.error} role="alert">{error}</p>}
            </div>

            <footer className={styles.footer}>
                <button type="button" className={styles.cancelButton} onClick={onClose}>취소</button>
                <button type="submit" className={styles.submitButton} disabled={Boolean(disabledReason) || !title.trim() || !content.trim() || isSubmitting || isGenerating}>
                    {isSubmitting ? "제출 중…" : "제출"}
                </button>
            </footer>
        </form>
    );
}
