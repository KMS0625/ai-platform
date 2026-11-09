export type Section = "chat" | "note" | "prompt";

const SECTION_MAP: { prefix: string; section: Section }[] = [
    { prefix: "/chat", section: "chat" },
    { prefix: "/note", section: "note" },
    { prefix: "/prompt", section: "prompt" },
];

type SideConfig = {
    buttonLabel: string;
    label: string;
    footer: string;
};

const SIDE_CONFIG = {
    chat: { buttonLabel: "새로운 채팅", label: "채팅 목록", footer: "설정" },
    note: { buttonLabel: "새로운 노트", label: "노트 목록", footer: "설정" },
    prompt: { buttonLabel: "새로운 프롬프트", label: "프롬프트 목록", footer: "설정" }
} satisfies Record<Section, SideConfig>;

export function getSection(pathname: string): Section {
    const matched = SECTION_MAP.find(
        ({ prefix }) => pathname === prefix || pathname.startsWith(prefix + "/")
    );
    return matched?.section ?? "chat";
}

export function getSideConfig(pathname: string) {
    const section = getSection(pathname);
    return { section, ...SIDE_CONFIG[section] };
}


