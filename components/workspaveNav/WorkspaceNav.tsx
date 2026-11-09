// components/WorkspaceNav.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { isSection } from "@/constants/section";
import styles from "@/app/(workspace)/layout.module.css";

const ITEMS = [
    { key: "chat", label: "채팅", href: "/chat" },
    { key: "note", label: "노트", href: "/note" },
    { key: "prompt", label: "프롬프트", href: "/prompt" },
] as const;

export default function WorkspaceNav() {
    const pathname = usePathname();
    const router = useRouter();
    const sectionName = pathname.split("/")[1];
    const section = isSection(sectionName) ? sectionName : null;

    return (
        <nav className={styles.nav}>
            {ITEMS.map((item, i) => (
                <span key={item.key}>
                    {i > 0 && <span>|</span>}
                    <button
                        className={section === item.key ? styles.active : ""}
                        onClick={() => router.push(item.href)}
                    >
                        {item.label}
                    </button>
                </span>
            ))}
        </nav>
    );
}