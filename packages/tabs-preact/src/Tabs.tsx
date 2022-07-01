import type { ComponentChild } from 'preact';
import { useRef } from 'preact/hooks';
import { useTabState } from './useTabState';

const tabSlotKey = 'tab.' as const;
const panelSlotKey = 'panel.' as const;

type TabSlot = `${typeof tabSlotKey}${string}`;
type PanelSlot = `${typeof panelSlotKey}${string}`;

function isTabSlotEntry(entry: [string, ComponentChild]): entry is [TabSlot, ComponentChild] {
	const [key] = entry;
	return key.startsWith(tabSlotKey);
}

function isPanelSlotEntry(entry: [string, ComponentChild]): entry is [PanelSlot, ComponentChild] {
	const [key] = entry;
	return key.startsWith(panelSlotKey);
}

function getBaseKeyFromTab(slot: TabSlot) {
	return slot.replace(new RegExp(`^${tabSlotKey}`), '')
}

function getBaseKeyFromPanel(slot: PanelSlot) {
	return slot.replace(new RegExp(`^${panelSlotKey}`), '')
}

type Props = {
	[key: TabSlot | PanelSlot]: ComponentChild;
	sharedStore?: string;
}

export default function Tabs({ sharedStore, ...slots }: Props) {
	const tabs = Object.entries(slots).filter(isTabSlotEntry)
	const panels = Object.entries(slots).filter(isPanelSlotEntry)
	/** Used to focus next and previous tab on arrow key press */
	const tabButtonRefs = useRef<Record<TabSlot, HTMLButtonElement | null>>({})

	const firstPanelKey = panels[0] ? getBaseKeyFromPanel(panels[0][0]) : ''
	const [curr, setCurr] = useTabState(firstPanelKey, sharedStore)

	function moveFocus(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			const currIdx = tabs.findIndex(([key]) => getBaseKeyFromTab(key) === curr)
			if (currIdx > 0) {
				const [prevTabKey] = tabs[currIdx - 1]
				setCurr(getBaseKeyFromTab(prevTabKey))
				tabButtonRefs.current[prevTabKey]?.focus()
			}
		}
		if (event.key === 'ArrowRight') {
			const currIdx = tabs.findIndex(([key]) => getBaseKeyFromTab(key) === curr)
			if (currIdx < tabs.length - 1) {
				const [nextTabKey] = tabs[currIdx + 1]
				setCurr(getBaseKeyFromTab(nextTabKey))
				tabButtonRefs.current[nextTabKey]?.focus()
			}
		}
	}

	return (
		<div data-astro-tabs>
			<div data-astro-tab-list role="tablist" onKeyDown={moveFocus}>
				{tabs.map(([key, content]) => (
					<button
						ref={el => tabButtonRefs.current[key] = el}
						onClick={() => setCurr(getBaseKeyFromTab(key))}
						aria-selected={curr === getBaseKeyFromTab(key)}
						tabIndex={curr === getBaseKeyFromTab(key) ? 0 : -1}
						role="tab"
						type="button"
						data-astro-tab
						id={key}
						key={key}
					>
						{content}
					</button>
				))}
			</div>
			{panels.map(([key, content]) => (
				<div
					hidden={curr !== getBaseKeyFromPanel(key)}
					role="tabpanel"
					aria-labelledby={`${tabSlotKey}${getBaseKeyFromPanel(key)}`}
					data-astro-tab-panel
					key={key}
				>
					{content}
				</div>
			))}
		</div>
	)
}
