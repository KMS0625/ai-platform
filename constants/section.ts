import { notFound } from "next/navigation";

export const SECTIONS = ["chat", "note", "prompt"] as const;
export type Section = (typeof SECTIONS)[number];
export type EmptyAction = "startChat" | "createNote" | "createPrompt";

// ── 섹션별 UI 문구 ──
type SideConfig = {
    buttonLabel: string;
    label: string;
    footer: string;
};

type EmptyConfig = {
    title: string;
    description: string;
    label: string;
    action: EmptyAction;
};

const SIDE_CONFIG = {
    chat: { buttonLabel: "새로운 채팅", label: "채팅 목록", footer: "설정" },
    note: { buttonLabel: "새로운 노트", label: "노트 목록", footer: "설정" },
    prompt: { buttonLabel: "새로운 프롬프트", label: "프롬프트 목록", footer: "설정" }
} satisfies Record<Section, SideConfig>;

const EMPTY_CONFIG = {
    chat: { title: "대화를 시작해 보세요", description: "채팅을 선택하거나 새로 만들어 보세요", label: "새로운 채팅 시작", action: "startChat" },
    note: { title: "노트가 비어 있어요", description: "노트를 선택하거나 새로 만들어 보세요", label: "새로운 노트 작성", action: "createNote"},
    prompt: { title: "프롬프트가 없어요", description: "프롬프트를 선택하거나 새로 만들어 보세요" , label: "새로운 프롬프트 작성", action:"createPrompt"}
} satisfies Record<Section, EmptyConfig>;


export function isSection(value: string): value is Section {
    return (SECTIONS as readonly string[]).includes(value);
}

export function requireSection(value: string): Section {
  if (!isSection(value)) notFound(); // notFound()는 반환하지 않으므로 이후 타입이 좁혀짐
  return value;
}

export const sectionPath  = (section: Section) => `/${section}`;
export const collectionPath = (section: Section, id: string) => `/${section}/${id}`;

export function getSection(pathname: string): Section {
    const first = pathname.split("/")[1] ?? "";
    return isSection(first) ? first : SECTIONS[0]; // 기본값: chat
}

export function getSideConfig(section: Section) {
    return { section, ...SIDE_CONFIG[section] };
}

export function getEmptyConfig(section: Section) {
    return { section, ...EMPTY_CONFIG[section] };
}