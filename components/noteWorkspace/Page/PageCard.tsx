"use client"
import Modal from "@/components/modal/Modal";
import styles from "./pageCard.module.css";
//type
import type { Page } from "@/models/Page";

//util
import { parseKeywords, ArrayToString } from "@/utils/parseKeywords";
import { useState } from "react";
import DeleteHelper from "@/components/modal/deleteHelper/DeleteHelper";

type PageCardProps = {
    pageView: Page;
    onChange: (id: string, changes: Partial<Page>) => void;
    onRemove: (id: string) => void;
};

function PageCard({
  	pageView,
  	onChange,
  	onRemove,
}: PageCardProps) {
  	const [ isDeleteOpen, setDeleteOpen] = useState(false);

	const handleSubmit = () => {
		onRemove(pageView.id);
		setDeleteOpen(false);
	}

  	const hintValue = 0;
  	const clamp = (v: string) => {
    	const n = Number(v);
    	if (Number.isNaN(n)) return 0;
    	return Math.min(100, Math.max(0, Math.round(n)));
  	}

  	return (
    <div className={styles.container}>  
    	<div className={styles.header}>
        	<label className={styles.toggle}>
				<input
					type="checkbox"
					className={styles.toggleInput}
					checked={pageView.enabled}
					onChange={(e) => onChange(pageView.id, { enabled:e.target.checked})}
				/>
				<span className={styles.toggleSlider}></span>
        	</label>
			<input 
			type="text"
			className={styles.title}
			defaultValue={pageView.title}
			onChange={(e) => onChange(pageView.id, { title: e.target.value })}>
			</input>
			<button className={styles.editButton} onClick={() => setDeleteOpen(true)}>
				x
			</button>
      	</div>

        <section className={styles.keywordSection}>
        	<label className={styles.sectionTitle}>
          		키워드
        	</label>

			<input
			type="text"
			className={styles.keywordInput}
			placeholder="키워드를 쉼표(,)로 구분하여 입력"
			defaultValue={ArrayToString(pageView.keywords)}
			onChange={(e) => onChange(pageView.id, { keywords: parseKeywords(e.target.value) })}
			/>
		</section>

      	<div className={styles.metaRow}>
			<label className={styles.metaItem}>
				<span className={styles.metaLabel}>우선도</span>
				<input
					type="number"
					min={0}
					max={100}
					value={pageView.priority}
					onChange={(e) => onChange(pageView.id, { priority: clamp(e.target.value) })}
					className={styles.metaInput}
				/>
			</label>

			<label className={styles.metaItem}>
				<span className={styles.metaLabel}>강조도</span>
				<input
					type="number"
					min={0}
					max={100}
					value={pageView.importance}
					onChange={(e) => onChange(pageView.id, { importance: clamp(e.target.value) })}
					className={styles.metaInput}
				/>
			</label>
      	</div>

      	<section className={styles.contentSection}>
    		<div className={styles.sectionHeader}>
        		<span className={styles.sectionTitle}>본문</span>
        		<span className={styles.sectionHint}>{hintValue}</span>
    		</div>
			<textarea
			className={styles.contentInput}
			placeholder="페이지 내용을 입력하세요."
			defaultValue={pageView.content}
			onChange={(e) => onChange(pageView.id, { content: e.target.value })}
			>

    	</textarea>
		</section>

        <Modal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)}>
            <DeleteHelper 
            title={`${pageView.title}을 삭제하시겠습니까?`}
            description={"삭제하면 복구할 수 없습니다."}
            onClose={() => setDeleteOpen(false)}
            onSubmit={handleSubmit}
            />
        </Modal>
    </div>
  );
}

export default PageCard;