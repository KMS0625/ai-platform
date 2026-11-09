import { useId, useState } from "react";
import styles from "./modelSelect.module.css";

import { MODEL_CATALOG, ModelInfo, PROVIDERS, getModelInfo } from "@/lib/models";

type ModelSelectProps = {
  onSubmit: (model: ModelInfo) => void;
  onClose: () => void;
};

const AVAILABLE_PROVIDERS = PROVIDERS.filter(
  (p) => MODEL_CATALOG[p].length > 0
);

function ModelSelect({ onSubmit, onClose }: ModelSelectProps) {
  const providerId = useId();
  const modelId = useId();

  const [provider, setProvider] = useState(AVAILABLE_PROVIDERS[0]);
  const [pickedModel, setPickedModel] = useState<string | null>(null);

  const models = MODEL_CATALOG[provider] ?? [];

  const model = models.some((m) => m.model === pickedModel)
    ? pickedModel
    : (models[0]?.model ?? null);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvider(e.target.value as typeof provider);
    setPickedModel(null);
  };

  const handleSubmit = () => {
    if (!model) return;
    onSubmit(getModelInfo(model));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>모델 추가</h2>
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
        대화에 사용할 AI 모델을 선택해주세요.
      </p>

      <div className={styles.selectionArea}>
        <div className={styles.formGroup}>
          <label htmlFor={providerId}>브랜드</label>
          <select
            id={providerId}
            value={provider}
            onChange={handleProviderChange}
          >
            {AVAILABLE_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor={modelId}>모델</label>
          <select
            id={modelId}
            value={model ?? ""}
            onChange={(e) => setPickedModel(e.target.value)}
            disabled={models.length === 0}
          >
            {models.map((m) => (
              <option key={m.model} value={m.model}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={`${styles.button} ${styles.cancelButton}`}
          onClick={onClose}
        >
          취소
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.addButton}`}
          onClick={handleSubmit}
          disabled={!model}
        >
          추가
        </button>
      </footer>
    </div>
  );
}

export default ModelSelect;