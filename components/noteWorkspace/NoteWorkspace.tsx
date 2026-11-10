
import { useNoteWorkspaceContext } from "@/context/NotespaceContextx";
import styles from "./noteWorkspace.module.css";
import PageCard from "./Page/PageCard";
import { Page } from "@/models/Page";

type NoteWorkSpaceProps = {

}

function NoteWorkSpace({

}:NoteWorkSpaceProps) {
    const { noteWorkspace: { createNote, pages, updatePage, createPage, deletePage } } = useNoteWorkspaceContext();

    const handleAddPage = () => {
        createPage();
    };

    const handleChangePage = (id: string, changes: Partial<Page>) => {
        updatePage(id, changes);
    }
    
    const handleRemovePage = (id: string) => {
        deletePage(id);
    }

    return (
        <div className={styles.container}>

            <section className={styles.app}>
                {pages.map((pageCard) => (
                    <PageCard key={pageCard.id}
                    pageView={pageCard}
                    onChange={handleChangePage}
                    onRemove={handleRemovePage}
                    ></PageCard>
                ))}
                
                <button
                    type="button"
                    className={styles.addPage}
                    onClick={() => handleAddPage()}
                    aria-label="페이지 추가"
                >
                    +
                </button>
            </section>
        </div>
    );
}

export default NoteWorkSpace;