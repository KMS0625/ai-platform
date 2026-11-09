import { Suspense, type ReactNode } from "react";
import WorkspaceNav from "@/components/workspaveNav/WorkspaceNav";

import styles from "./layout.module.css";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <main className={styles.page}>
            <div className={styles.topspace}>
                <Suspense fallback={<nav className={styles.nav} />}>
                    <WorkspaceNav />
                </Suspense>
            </div>
            {children}
        </main>
    );
}


// "use client";

// import { Suspense, type ReactNode } from "react";
// import { usePathname, useRouter } from "next/navigation";

// import SideContainer from "@/components/side/SideContainer";
// import { isSection, type Section } from "@/constants/section";

// import styles from "./layout.module.css";
// import { CollectionProvider } from "@/context/CollectionContext";
// import WorkspaceNav from "./WorkspaceNav";

// export default function WorkspaceLayoutClient({
//     children
// }: {
//     children: ReactNode
// }) {
//     return (
//         <main className={styles.page}>
//             <div className={styles.topspace}>
//                 <Suspense fallback={<nav className={styles.nav} />}>
//                     <WorkspaceNav />
//                 </Suspense>
//             </div>

//             <div className={styles.app}>
//                 <CollectionProvider>
//                 <aside className={styles.side}>
//                     <SideContainer/>
//                     </aside>
//                     <main className={styles.main}>{children}</main>
//                 </CollectionProvider>
//             </div>
//         </main>
//     );
// }