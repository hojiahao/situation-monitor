<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { workflowStore, workflowEvents } from '$lib/stores';

	const workflow = $derived($workflowStore.currentWorkflow);
	const events = $derived($workflowEvents);
	const loading = $derived($workflowStore.loading);
	const error = $derived($workflowStore.error);

	let activeFilter = $state<string>('all');
	let expandedId = $state<string | null>(null);

	const EVENT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
		phase_start: { icon: '▶', color: 'var(--blue)', label: 'Start' },
		phase_complete: { icon: '✓', color: 'var(--green)', label: 'Complete' },
		asset_created: { icon: '◆', color: '#8844ff', label: 'Asset' },
		quality_check: { icon: '◎', color: 'var(--yellow)', label: 'QA' },
		error: { icon: '✗', color: 'var(--red)', label: 'Error' },
		retry: { icon: '↻', color: 'var(--yellow)', label: 'Retry' },
	};

	const FILTER_OPTIONS = [
		{ id: 'all', label: 'All' },
		{ id: 'phase_start', label: '▶' },
		{ id: 'phase_complete', label: '✓' },
		{ id: 'asset_created', label: '◆' },
		{ id: 'quality_check', label: '◎' },
		{ id: 'error', label: '✗' },
		{ id: 'retry', label: '↻' },
	];

	const filtered = $derived(
		activeFilter === 'all' ? events : events.filter(e => e.type === activeFilter)
	);

	function formatTime(ts: string): string {
		const d = new Date(ts);
		return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
	}

	function toggleExpand(id: string) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<Panel id="event-log" title="EVENT LOG" {loading} {error} count={events.length}>
	{#if !workflow}
		<div class="empty">No workflow data</div>
	{:else}
		<!-- Filters -->
		<div class="filters">
			{#each FILTER_OPTIONS as opt}
				<button
					class="filter-btn"
					class:active={activeFilter === opt.id}
					onclick={() => activeFilter = opt.id}
					style={opt.id !== 'all' ? `--fc: ${EVENT_CONFIG[opt.id]?.color || 'var(--text)'}` : ''}
				>
					{opt.label}
				</button>
			{/each}
		</div>

		<!-- Event list -->
		<div class="event-list">
			{#each filtered as event, i (event.id)}
				{@const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG.phase_start}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="event-row" class:fade-in={i === 0} onclick={() => event.details && toggleExpand(event.id)}>
					<span class="event-time">{formatTime(event.timestamp)}</span>
					<span class="event-icon" style="color: {cfg.color}">{cfg.icon}</span>
					<span class="event-msg">{event.message}</span>
					{#if event.details}
						<span class="event-expand">{expandedId === event.id ? '▾' : '▸'}</span>
					{/if}
				</div>
				{#if expandedId === event.id && event.details}
					<div class="event-details" style="border-left-color: {cfg.color}">
						{event.details}
					</div>
				{/if}
			{/each}
			{#if filtered.length === 0}
				<div class="empty-small">No events</div>
			{/if}
		</div>
	{/if}
</Panel>

<style>
	.empty {
		text-align: center;
		color: var(--text-muted);
		padding: 2rem;
		font-size: 0.7rem;
	}

	.empty-small {
		text-align: center;
		color: var(--text-muted);
		padding: 1rem;
		font-size: 0.6rem;
	}

	.filters {
		display: flex;
		gap: 0.2rem;
		margin-bottom: 0.4rem;
		flex-wrap: wrap;
	}

	.filter-btn {
		font-size: 0.7rem;
		padding: 0.2rem 0.4rem;
		border: 1px solid var(--border);
		border-radius: 3px;
		background: transparent;
		color: var(--fc, var(--text-dim));
		cursor: pointer;
		transition: background 0.2s, border-color 0.2s;
	}

	.filter-btn:hover {
		background: var(--surface-hover);
	}

	.filter-btn.active {
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--fc, var(--text-dim));
		font-weight: 600;
	}

	.event-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		max-height: 350px;
		min-width: 0;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--border) transparent;
	}

	.event-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.25rem 0.15rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.03);
		cursor: default;
		transition: background 0.15s;
	}

	.event-row:hover {
		background: var(--surface-hover);
	}

	.event-time {
		font-size: 0.7rem;
		color: var(--text-dim);
		font-family: 'SF Mono', 'Fira Code', monospace;
		min-width: 3em;
		flex-shrink: 0;
	}

	.event-icon {
		font-size: 0.85rem;
		flex-shrink: 0;
		width: 1em;
		text-align: center;
	}

	.event-msg {
		font-size: 0.8rem;
		color: #ffffff;
		flex: 1;
		min-width: 0;
	}

	.event-expand {
		font-size: 0.7rem;
		color: var(--text-muted);
		cursor: pointer;
		flex-shrink: 0;
	}

	.event-details {
		font-size: 0.75rem;
		color: var(--text-dim);
		padding: 0.3rem 0.5rem 0.3rem 2.5rem;
		border-left: 2px solid;
		margin-left: 1rem;
		margin-bottom: 0.15rem;
		background: rgba(255, 255, 255, 0.02);
	}

	.fade-in {
		animation: fadeIn 0.5s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
