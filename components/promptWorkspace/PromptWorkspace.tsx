"use client";

import { useMemo, useState } from "react";
import {
    DEFAULT_PROMPT_PARAMS,
    PromptParams,
    PromptUpdateData,
} from "@/models/Prompt";
import styles from "./promptWorkspace.module.css";

type PromptDraft = Required<PromptUpdateData>;

const DEFAULT_DRAFT: PromptDraft = {
    title: "",
    description: "",
    content: "",
    ...DEFAULT_PROMPT_PARAMS,
};

const PRESETS: { label: string; hint: string; values: Partial<PromptParams> }[] = [
    { label: "정확하게", hint: "요약, 추출, 분류처럼 답이 정해진 작업", values: { temperature: 0.2, topP: 0.9 } },
    { label: "균형", hint: "일반 대화, 설명, 글쓰기", values: { temperature: 0.7, topP: 1 } },
    { label: "창의적", hint: "아이디어 구상, 스토리, 카피 작성", values: { temperature: 1.1, topP: 1 } },
];

type SliderDef = {
    key: keyof PromptParams;
    label: string;
    hint: string;
    min: number;
    max: number;
    step: number;
    /** 값이 0일 때 숫자 대신 보여줄 문구 */
    zeroLabel?: string;
};

const SLIDERS: SliderDef[] = [
    { key: "temperature", label: "Temperature", hint: "높을수록 답이 다양해지고, 낮을수록 일정해져요.", min: 0, max: 2, step: 0.05 },
    { key: "topP", label: "Top P", hint: "상위 확률 단어만 후보로 써요. 보통 Temperature와 하나만 조절해요.", min: 0, max: 1, step: 0.05 },
    {
        key: "maxInputTokens",
        label: "최대 입력 길이",
        hint: "입력으로 보낼 수 있는 한도(토큰)예요. 0이면 모델 기본값을 사용해요.",
        min: 0,
        max: 32768,
        step: 256,
        zeroLabel: "모델 기본값",
    },
    { key: "maxOutputTokens", label: "최대 출력 길이", hint: "답변이 길어질 수 있는 한도(토큰)예요.", min: 64, max: 8192, step: 64 },
    { key: "frequencyPenalty", label: "반복 억제", hint: "같은 단어가 반복되는 것을 줄여요.", min: -2, max: 2, step: 0.1 },
    { key: "presencePenalty", label: "주제 확장", hint: "높을수록 새로운 주제를 꺼내려 해요.", min: -2, max: 2, step: 0.1 },
];

const VARIABLE_PATTERN = /\{\{\s*([\w가-힣]+)\s*\}\}/g;

type Props = {
    initial?: Partial<PromptDraft>;
    /** 바뀐 필드만 전달 (usePromptAutoSave의 schedule에 연결) */
    onChange?: (changes: PromptUpdateData) => void;
};

export default function PromptWorkspace({ initial, onChange }: Props) {
    const [draft, setDraft] = useState<PromptDraft>(() => ({
        title: initial?.title ?? DEFAULT_DRAFT.title,
        description: initial?.description ?? DEFAULT_DRAFT.description,
        content: initial?.content ?? DEFAULT_DRAFT.content,
        temperature: initial?.temperature ?? DEFAULT_DRAFT.temperature,
        topP: initial?.topP ?? DEFAULT_DRAFT.topP,
        maxInputTokens: initial?.maxInputTokens ?? DEFAULT_DRAFT.maxInputTokens,
        maxOutputTokens: initial?.maxOutputTokens ?? DEFAULT_DRAFT.maxOutputTokens,
        frequencyPenalty: initial?.frequencyPenalty ?? DEFAULT_DRAFT.frequencyPenalty,
        presencePenalty: initial?.presencePenalty ?? DEFAULT_DRAFT.presencePenalty,
    }));
    const [copied, setCopied] = useState(false);

    const update = (changes: PromptUpdateData) => {
        setDraft((prev) => ({ ...prev, ...changes }));
        onChange?.(changes);
    };

    const variables = useMemo(() => {
        const found = [...draft.content.matchAll(VARIABLE_PATTERN)].map((m) => m[1]);
        return [...new Set(found)];
    }, [draft.content]);

    // 한글/영문이 섞여 있어 정확하진 않지만 대략적인 감을 주는 추정치
    const estimatedTokens = Math.ceil(draft.content.length / 2);

    const activePreset = PRESETS.find((p) =>
        Object.entries(p.values).every(
            ([k, v]) => draft[k as keyof PromptParams] === v
        )
    );

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(draft.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            console.error("복사 실패:", error);
        }
    };

    return (
        <div className={styles.workspace}>
            <section className={styles.main}>
                <input
                    className={styles.title}
                    value={draft.title}
                    onChange={(e) => update({ title: e.target.value })}
                    placeholder="프롬프트 이름"
                    aria-label="프롬프트 이름"
                />

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="prompt-description">설명</label>
                    <textarea
                        id="prompt-description"
                        className={styles.description}
                        value={draft.description}
                        onChange={(e) => update({ description: e.target.value })}
                        placeholder="이 프롬프트가 언제, 어떤 용도로 쓰이는지 적어두세요."
                        rows={2}
                    />
                </div>

                <div className={`${styles.field} ${styles.grow}`}>
                    <div className={styles.labelRow}>
                        <label className={styles.label} htmlFor="prompt-content">프롬프트 본문</label>
                        <div className={styles.meta}>
                            <span>{draft.content.length}자 · 약 {estimatedTokens} 토큰</span>
                            <button
                                type="button"
                                className={styles.ghost}
                                onClick={handleCopy}
                                disabled={!draft.content}
                            >
                                {copied ? "복사됨" : "복사"}
                            </button>
                        </div>
                    </div>
                    <textarea
                        id="prompt-content"
                        className={styles.content}
                        value={draft.content}
                        onChange={(e) => update({ content: e.target.value })}
                        placeholder={"프롬프트를 입력하세요.\n변수는 {{이름}} 형식으로 쓰면 아래에 자동으로 모아져요."}
                    />
                    <div className={styles.variables}>
                        <span className={styles.variablesLabel}>변수</span>
                        {variables.length === 0 ? (
                            <span className={styles.muted}>아직 없어요</span>
                        ) : (
                            variables.map((v) => (
                                <code key={v} className={styles.chip}>{`{{${v}}}`}</code>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <aside className={styles.side} aria-label="파라미터">
                <div className={styles.sideHeader}>
                    <h2 className={styles.sideTitle}>파라미터</h2>
                    <button
                        type="button"
                        className={styles.ghost}
                        onClick={() => update(DEFAULT_PROMPT_PARAMS)}
                    >
                        초기화
                    </button>
                </div>

                <div className={styles.presets} role="group" aria-label="프리셋">
                    {PRESETS.map((p) => (
                        <button
                            key={p.label}
                            type="button"
                            className={`${styles.preset} ${activePreset === p ? styles.presetActive : ""}`}
                            onClick={() => update(p.values)}
                            title={p.hint}
                            aria-pressed={activePreset === p}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <p className={styles.presetHint}>
                    {activePreset ? activePreset.hint : "슬라이더로 직접 조절 중이에요."}
                </p>

                <div className={styles.sliders}>
                    {SLIDERS.map((s) => {
                        const value = draft[s.key];
                        const pct = ((value - s.min) / (s.max - s.min)) * 100;
                        const isDefault = s.zeroLabel !== undefined && value === 0;
                        return (
                            <div key={s.key} className={styles.slider}>
                                <div className={styles.sliderHead}>
                                    <label htmlFor={`param-${s.key}`}>{s.label}</label>
                                    <output
                                        className={`${styles.value} ${isDefault ? styles.valueDefault : ""}`}
                                    >
                                        {isDefault ? s.zeroLabel : value}
                                    </output>
                                </div>
                                <input
                                    id={`param-${s.key}`}
                                    type="range"
                                    className={styles.range}
                                    min={s.min}
                                    max={s.max}
                                    step={s.step}
                                    value={value}
                                    style={{ "--pct": `${pct}%` } as React.CSSProperties}
                                    onChange={(e) =>
                                        update({ [s.key]: Number(e.target.value) } as Partial<PromptParams>)
                                    }
                                />
                                <p className={styles.sliderHint}>{s.hint}</p>
                            </div>
                        );
                    })}
                </div>

                {draft.temperature > 1 && draft.topP < 1 && (
                    <p className={styles.notice}>
                        Temperature와 Top P를 둘 다 바꾸면 결과를 예측하기 어려워져요. 하나만 조절하는 걸 권장해요.
                    </p>
                )}
            </aside>
        </div>
    );
}