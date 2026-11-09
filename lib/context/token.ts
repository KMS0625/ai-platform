import { countTokens } from 'gpt-tokenizer';

export function getToken(str: string): number {
    return countTokens(str);
}