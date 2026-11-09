

// temperature / topP / topK 를 더 이상 받지 않는 모델 (새 모델 나오면 여기 추가)
const NO_SAMPLING = /^gemini-(3\.5-flash-lite|3\.6|3\.8|4)/;

export const supportsSampling = (model: string) => !NO_SAMPLING.test(model);