import { Accessor, createSignal } from 'solid-js';

export function useTabState(initialCurr: string, storeKey?: string): [Accessor<string>, (curr: string) => void] {
	const [curr, setCurr] = createSignal(initialCurr);

	return [curr, setCurr]
}
