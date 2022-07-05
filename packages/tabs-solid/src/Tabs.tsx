
import { Component, splitProps } from 'solid-js';
import { useTabState } from './useTabState';
const tabSlotKey = 'tab-' as const;
const panelSlotKey = 'panel-' as const;

type TabSlot = `${typeof tabSlotKey}${string}`;
type PanelSlot = `${typeof panelSlotKey}${string}`;

function isTabSlotEntry(entry: [string, Component]): entry is [TabSlot, Component] {
	const [key] = entry;
	return key.startsWith(tabSlotKey);
}

function isTabSlotKey(key: string): key is TabSlot {
	return key.startsWith(tabSlotKey);
}

function isPanelSlotKey(key: string): key is PanelSlot {
	return key.startsWith(panelSlotKey);
}

function isPanelSlotEntry(entry: [string, Component]): entry is [PanelSlot, Component] {
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
	[key: TabSlot | PanelSlot]: Component;
	sharedStore?: string;
}

const Tabs: Component<Props> = (props) => {
	const [tabs] = splitProps(props, Object.keys(props).filter(isTabSlotKey))
	const [panels] = splitProps(props, Object.keys(props).filter(isPanelSlotKey))

	const tabEntries = Object.entries(tabs).filter(isTabSlotEntry)
	const panelEntries = Object.entries(panels).filter(isPanelSlotEntry)
	console.log(panelEntries)
	
	/** Used to focus next and previous tab on arrow key press */
	const tabButtonRefs: Record<TabSlot, HTMLButtonElement | null> = {}

	const firstPanelKey = panelEntries[0] ? getBaseKeyFromPanel(panelEntries[0][0]) : ''
	const [curr, setCurr] = useTabState(firstPanelKey, props.sharedStore)

	function moveFocus(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			const currIdx = tabEntries.findIndex(([key]) => getBaseKeyFromTab(key) === curr())
			if (currIdx > 0) {
				const [prevTabKey] = tabEntries[currIdx - 1]
				setCurr(getBaseKeyFromTab(prevTabKey))
				tabButtonRefs[prevTabKey]?.focus()
			}
		}
		if (event.key === 'ArrowRight') {
			const currIdx = tabEntries.findIndex(([key]) => getBaseKeyFromTab(key) === curr())
			if (currIdx < tabEntries.length - 1) {
				const [nextTabKey] = tabEntries[currIdx + 1]
				setCurr(getBaseKeyFromTab(nextTabKey))
				tabButtonRefs[nextTabKey]?.focus()
			}
		}
	}

	return (
		<div data-astro-tabs>
			<div data-astro-tab-list role="tablist" onKeyDown={moveFocus}>
				{tabEntries.map(([key, content]) => (
					<button
						ref={el => tabButtonRefs[key] = el}
						onClick={() => setCurr(getBaseKeyFromTab(key))}
						aria-selected={curr() === getBaseKeyFromTab(key)}
						tabIndex={curr() === getBaseKeyFromTab(key) ? 0 : -1}
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
			{panelEntries.map(([key, content]) => (
				<div
					hidden={curr() !== getBaseKeyFromPanel(key)}
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

export default Tabs
