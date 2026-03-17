<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { workflowStore, workflowPhases, workflowRoles } from '$lib/stores';

	const workflow = $derived($workflowStore.currentWorkflow);
	const phases = $derived($workflowPhases);
	const roles = $derived($workflowRoles);
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

	function statusLabel(status: string): string {
		switch (status) {
			case 'completed': return 'DONE';
			case 'in_progress': return 'RUNNING';
			case 'failed': return 'FAILED';
			case 'skipped': return 'SKIPPED';
			default: return 'PENDING';
		}
	}

	function elapsed(startedAt?: string): string {
		if (!startedAt) return '--';
		const ms = Date.now() - new Date(startedAt).getTime();
		const m = Math.floor(ms / 60000);
		if (m < 60) return `${m}m`;
		return `${Math.floor(m / 60)}h ${m % 60}m`;
	}

	function durationStr(ms?: number): string {
		if (!ms) return '';
		const m = Math.round(ms / 60000);
		return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60}m`;
	}

	function roleForActor(actorId: string) {
		return roles.find(r => r.id === actorId);
	}

	const activePhase = $derived(phases.find(p => p.status === 'in_progress'));
</script>

<Panel id="workflow-overview" title="WORKFLOW PROGRESS" {loading} {error}>
	{#if !workflow}
		<div class="empty">No workflow loaded</div>
	{:else}
		<!-- Overview Bar -->
		<div class="overview-bar">
			<div class="overview-info">
				<div class="wf-name">{workflow.meta.name}</div>
				<div class="wf-desc">{workflow.meta.description}</div>
				<div class="wf-meta">
					<span class="status-badge" style="color: {statusColor(workflow.meta.status)}; border-color: {statusColor(workflow.meta.status)}">
						{statusLabel(workflow.meta.status)}
					</span>
					<span class="meta-item">⏱ {elapsed(workflow.meta.started_at)}</span>
					<span class="meta-item">📐 {workflow.meta.estimated_duration}</span>
				</div>
			</div>
			<div class="progress-ring">
				<svg viewBox="0 0 50 50">
					<circle cx="25" cy="25" r="20" fill="none" stroke="var(--border)" stroke-width="3" />
					<circle cx="25" cy="25" r="20" fill="none" stroke={statusColor(workflow.meta.status)} stroke-width="3"
						stroke-dasharray={`${workflow.meta.progress * 1.257} 125.7`}
						stroke-linecap="round" transform="rotate(-90 25 25)" />
					<text x="25" y="27" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">
						{workflow.meta.progress}%
					</text>
				</svg>
			</div>
		</div>

		<!-- Phase Cards -->
		<div class="phase-track">
			{#each phases as phase, i (phase.id)}
				<div class="phase-card" style="border-color: {statusColor(phase.status)}">
					<div class="phase-header">
						<span class="phase-num" style="background: {statusColor(phase.status)}">{phase.order}</span>
						{#if roleForActor(phase.actor)}
							<span class="actor-avatar">{roleForActor(phase.actor)?.avatar}</span>
						{/if}
						<span class="phase-name">{phase.name}</span>
					</div>
					<div class="phase-progress-wrap">
						<div class="phase-progress-bar">
							<div class="phase-progress-fill" class:shimmer={phase.status === 'in_progress'}
								style="width: {phase.progress}%; background: {statusColor(phase.status)}" />
						</div>
						<span class="phase-pct">{phase.progress}%</span>
					</div>
					<div class="phase-footer">
						<span class="phase-io">📥{phase.inputs.length} 📤{phase.outputs.length}</span>
						{#if phase.duration_ms}
							<span class="phase-time">{durationStr(phase.duration_ms)}</span>
						{/if}
					</div>
				</div>
				{#if i < phases.length - 1}
					<div class="phase-arrow">→</div>
				{/if}
			{/each}
		</div>

		<!-- Role Status Row -->
		<div class="role-row">
			{#each roles as role (role.id)}
				{@const isActive = activePhase?.actor === role.id}
				<div class="role-card" class:active={isActive} style="border-color: {role.color}">
					<span class="role-avatar">{role.avatar}</span>
					<span class="role-name">{role.name}</span>
					<span class="role-action">{role.current_action || 'Idle'}</span>
				</div>
			{/each}
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

	.overview-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
		margin-bottom: 0.5rem;
	}

	.overview-info { flex: 1; min-width: 0; }

	.wf-name {
		font-size: 1rem;
		font-weight: 700;
		color: #ffffff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.wf-desc {
		font-size: 0.75rem;
		color: var(--text-dim);
		margin-top: 0.15rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.wf-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.3rem;
	}

	.status-badge {
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.15rem 0.4rem;
		border: 1px solid;
		border-radius: 3px;
		letter-spacing: 0.05em;
	}

	.meta-item {
		font-size: 0.75rem;
		color: var(--text-dim);
	}

	.progress-ring {
		width: 60px;
		height: 60px;
		flex-shrink: 0;
	}

	.progress-ring svg { width: 100%; height: 100%; }

	/* Phase Track */
	.phase-track {
		display: flex;
		align-items: center;
		gap: 0;
		overflow-x: auto;
		padding: 0.5rem 0;
		scrollbar-width: thin;
		scrollbar-color: var(--border) transparent;
	}

	.phase-card {
		min-width: 120px;
		max-width: 140px;
		flex-shrink: 0;
		background: var(--bg);
		border: 1.5px solid;
		border-radius: 6px;
		padding: 0.5rem 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		transition: border-color 0.3s, box-shadow 0.3s;
	}

	.phase-card:hover {
		background: var(--surface-hover);
	}

	.phase-header {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		overflow: hidden;
		flex-wrap: nowrap;
	}

	.phase-num {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.5rem;
		font-weight: 700;
		color: #000;
		flex-shrink: 0;
	}

	.actor-avatar {
		font-size: 0.65rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.phase-name {
		font-size: 0.6rem;
		font-weight: 600;
		color: #ffffff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex: 1;
	}

	.phase-progress-wrap {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.phase-progress-bar {
		flex: 1;
		height: 6px;
		background: var(--border);
		border-radius: 2px;
		overflow: hidden;
	}

	.phase-progress-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.5s ease;
	}

	.phase-progress-fill.shimmer {
		background-image: linear-gradient(
			90deg,
			var(--yellow) 0%,
			#ffe066 50%,
			var(--yellow) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.phase-pct {
		font-size: 0.7rem;
		font-weight: 600;
		color: #ffffff;
		min-width: 2em;
		text-align: right;
	}

	.phase-footer {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		color: var(--text-dim);
	}

	.phase-arrow {
		color: #ffffff;
		font-size: 1rem;
		flex-shrink: 0;
		padding: 0 0.15rem;
	}

	/* Role Row */
	.role-row {
		display: flex;
		gap: 0.4rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border);
		margin-top: 0.25rem;
	}

	.role-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		padding: 0.4rem;
		border: 1px solid;
		border-radius: 6px;
		background: var(--bg);
		opacity: 0.4;
		transition: opacity 0.3s, box-shadow 0.3s;
	}

	.role-card.active {
		opacity: 1;
		box-shadow: 0 0 8px rgba(255, 255, 255, 0.1);
		animation: pulse-glow 2s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%, 100% { box-shadow: 0 0 4px rgba(255, 255, 255, 0.05); }
		50% { box-shadow: 0 0 12px rgba(255, 255, 255, 0.15); }
	}

	.role-avatar { font-size: 1.4rem; }
	.role-name { font-size: 0.75rem; font-weight: 600; color: #ffffff; }
	.role-action { font-size: 0.7rem; color: var(--text-dim); text-align: center; }
</style>
