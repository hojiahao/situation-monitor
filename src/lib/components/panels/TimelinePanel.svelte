<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { workflowStore, workflowPhases } from '$lib/stores';

	const workflow = $derived($workflowStore.currentWorkflow);
	const phases = $derived($workflowPhases);
	const loading = $derived($workflowStore.loading);
	const error = $derived($workflowStore.error);

	function statusColor(status: string): string {
		switch (status) {
			case 'completed': return 'var(--green)';
			case 'in_progress': return 'var(--yellow)';
			case 'failed': return 'var(--red)';
			default: return 'var(--border-light)';
		}
	}


	function formatDuration(ms?: number): string {
		if (!ms) return '';
		const m = Math.round(ms / 60000);
		return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60}m`;
	}

	// Calculate timeline metrics
	const timelineData = $derived.by(() => {
		if (!workflow || phases.length === 0) return null;

		const startTime = workflow.meta.started_at ? new Date(workflow.meta.started_at).getTime() : Date.now();
		const now = Date.now();
		const totalElapsed = now - startTime;

		// Estimate total duration based on completed + estimated remaining
		let totalMs = 0;
		phases.forEach(p => {
			if (p.duration_ms) totalMs += p.duration_ms;
			else if (p.status === 'in_progress') {
				const pStart = p.started_at ? new Date(p.started_at).getTime() : now;
				totalMs += now - pStart;
			} else {
				totalMs += 300000; // default 5min estimate for pending (shorter bars)
			}
		});

		const scale = totalMs > 0 ? 100 / totalMs : 1;
		let offset = 0;

		const bars = phases.map(p => {
			let dur = p.duration_ms || 0;
			if (p.status === 'in_progress' && p.started_at) {
				dur = now - new Date(p.started_at).getTime();
			} else if (p.status === 'pending') {
				dur = 300000;
			}
			const width = dur * scale;
			const left = offset;
			offset += width;
			return { ...p, barLeft: left, barWidth: width, dur };
		});

		const nowPos = totalElapsed * scale;
		return { bars, nowPos, totalMs };
	});
</script>

<Panel id="timeline" title="EXECUTION TIMELINE" {loading} {error}>
	{#if !workflow || !timelineData}
		<div class="empty">No workflow data</div>
	{:else}
		<div class="timeline">
			{#each timelineData.bars as bar (bar.id)}
				<div class="tl-row">
					<div class="tl-label">{bar.name}</div>
					<div class="tl-track">
						<div
							class="tl-bar"
							class:pending={bar.status === 'pending'}
							class:in-progress={bar.status === 'in_progress'}
							style="left: {Math.min(bar.barLeft, 95)}%; width: {Math.min(Math.max(bar.barWidth, 2), 98 - bar.barLeft)}%; background: {bar.status === 'pending' ? 'transparent' : statusColor(bar.status)}; border-color: {statusColor(bar.status)};"
						>
							{#if bar.dur > 0}
								<span class="tl-dur">{formatDuration(bar.dur)}</span>
							{/if}
						</div>
						<!-- Quality gate diamond -->
						<div class="tl-gate" style="left: {Math.min(bar.barLeft + bar.barWidth, 96)}%">
							<span style="color: {bar.status === 'completed' ? 'var(--green)' : bar.status === 'failed' ? 'var(--red)' : 'var(--text-muted)'}">◆</span>
						</div>
					</div>
				</div>
			{/each}
			<!-- Now indicator -->
			{#if workflow.meta.status === 'in_progress'}
				<div class="tl-now" style="left: calc(100px + {Math.min(timelineData.nowPos, 96)}% * (100% - 100px) / 100)"></div>
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

	.timeline {
		position: relative;
		padding: 0.25rem 0;
		overflow: hidden;
		width: 100%;
	}

	.tl-row {
		display: flex;
		align-items: center;
		height: 34px;
		gap: 0;
		width: 100%;
		overflow: hidden;
	}

	.tl-label {
		width: 100px;
		flex-shrink: 0;
		font-size: 0.75rem;
		font-weight: 500;
		color: #ffffff;
		text-align: right;
		padding-right: 0.5rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tl-track {
		flex: 1;
		height: 22px;
		position: relative;
		background: rgba(255, 255, 255, 0.04);
		border-radius: 3px;
		min-width: 0;
		overflow: hidden;
		margin-right: 0.25rem;
	}

	.tl-bar {
		position: absolute;
		top: 2px;
		height: 18px;
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 2px;
		transition: width 0.5s ease, left 0.5s ease;
	}

	.tl-bar.pending {
		border: 1px dashed var(--border-light);
	}

	.tl-bar.in-progress {
		background-image: repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 4px,
			rgba(0, 0, 0, 0.15) 4px,
			rgba(0, 0, 0, 0.15) 8px
		) !important;
		animation: stripe-move 1s linear infinite;
	}

	@keyframes stripe-move {
		0% { background-position: 0 0; }
		100% { background-position: 16px 0; }
	}

	.tl-dur {
		font-size: 0.65rem;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.8);
		white-space: nowrap;
	}

	.tl-gate {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		font-size: 0.65rem;
		line-height: 1;
	}

	.tl-now {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		border-left: 1.5px dashed var(--red);
		z-index: 5;
		opacity: 0.7;
	}
</style>
