import "server-only";
import { ThreadMessage } from "@/types/ThreadMessage";
import { getToken } from "./token";

export type ChatMessage = {
	role: "user" | "assistant" | "system";
	content: string;
};

export type PageContent = {
	priority: number;   // 0 ~ 100 (100 = 맨 앞, 0 = 맨 뒤)
	importance: number; // 높을수록 먼저 선정한다.
	content: string;
};

type BuildContextInput = {
	systemPrompt?: string;
	pages: PageContent[];
	history: ThreadMessage[]; // 오래된 → 최신 순
	question: string;
	maxToken: number;
};

const clampPriority = (p: number) => Math.min(100, Math.max(0, p));

// 페이지 선정: importance 높은 순으로 예산 안에 들어가는 페이지만 고른다.
function selectPages(
	pages: PageContent[],
	budget: number
): { selected: PageContent[]; used: number } {
	const byImportance = [...pages].sort((a, b) => b.importance - a.importance);

	const selected: PageContent[] = [];
	let used = 0;

	for (const page of byImportance) {
		const t = getToken(page.content);
		if (used + t > budget) continue; // 안 들어가면 건너뛰고 작은 것으로 채움
		used += t;
		selected.push(page);
  	}

  	return { selected, used };
}

// 메시지 선정 최신 이력부터, 예산 안에 들어가는 만큼만 고른다. (최근 메시지 부터)/
function selectHistory(
  	history: ThreadMessage[],
  	budget: number
): ChatMessage[] {
  	const selected: ChatMessage[] = [];
  	let used = 0;

  for (let i = 0; i < history.length; i++) {
    	const m = history[i];
    	const t = getToken(m.content);

    	if (used + t > budget) break; 

		used += t;
		selected.push({
			role: m.role === "ai" ? "assistant" : "user",
			content: m.content,
		});
 	 }

  	return selected;
}

/**
 * 배치: priority를 퍼센트로 삼아 대화 배열 안의 위치를 계산해서 페이지를 끼워 넣는다.
 * 위치 = (100 - priority)% 지점
 *   priority 100 → 0%   (맨 앞)
 *   priority  50 → 50%  (중간)
 *   priority   0 → 100% (맨 뒤, 질문 직전)
 */
function placePages(
  	pages: PageContent[],
  	history: ChatMessage[]
): ChatMessage[] {
  	const n = history.length;
  
  	// 슬롯 i = "history[i] 앞" (슬롯 n = 이력 맨 뒤, 질문 직전)
  	const slots: PageContent[][] = Array.from({ length: n + 1 }, () => []);

  	for (const page of pages) {
    	const ratio = clampPriority(page.priority) / 100; 
    	const index = Math.round((1 - ratio) * n);
    	slots[index].push(page);
  	}

  const result: ChatMessage[] = [];

	for (let i = 0; i <= n; i++) {
		// 같은 슬롯 안에서는 priority 낮은 순 → 높은 것이 더 뒤에 옴
		slots[i]
		.sort((a, b) => clampPriority(b.priority) - clampPriority(a.priority))
		.forEach((p) => result.push({ role: "user", content: p.content }));

		if (i < n) result.push(history[i]);
  }

  return result;
}

export function buildContext({
	systemPrompt,
	pages,
	history,
	question,
	maxToken,
}: BuildContextInput): ChatMessage[] {
	const userMessage: ChatMessage = { role: "user", content: question };
	
	// ───────── 1. 예산 계산 (선정) ─────────
	let used = 0;
	
	// 1-1. 유저 질문
	used += getToken(question);
	if (used >= maxToken) return [userMessage];

  	// 1-2. 시스템 프롬프트
  	let systemMessage: ChatMessage | null = null;
	if (systemPrompt) {
		const t = getToken(systemPrompt);
		if (used + t <= maxToken) {
		used += t;
		systemMessage = { role: "system", content: systemPrompt };
		}
	}

	// 1-3. 페이지 선정 (importance 순)
	const { selected: selectedPages, used: pageUsed } = selectPages(
		pages,
		maxToken - used
	);
	used += pageUsed;

	// 1-4. 과거 이력 선정 (최신부터)
	const selectedHistory = selectHistory(history, maxToken - used);

	// ───────── 2. 배치 (priority 퍼센트 위치) ─────────
	const body = placePages(selectedPages, selectedHistory);

	return [
		userMessage,
		...body,
		...(systemMessage ? [systemMessage] : []),
	];
}