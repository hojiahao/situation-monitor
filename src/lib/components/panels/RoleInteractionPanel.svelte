<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { workflowStore, workflowRoles, workflowPhases } from '$lib/stores';

	const workflow = $derived($workflowStore.currentWorkflow);
	const roles = $derived($workflowRoles);
	const phases = $derived($workflowPhases);
	const loading = $derived($workflowStore.loading);
	const error = $derived($workflowStore.error);

	const activePhase = $derived(phases.find(p => p.status === 'in_progress'));

	function typeLabel(type: string): string {
		switch (type) {
			case 'human': return 'HUMAN';
			case 'ai_agent': return 'AI AGENT';
			case 'image_gen': return 'IMAGE GEN';
			case 'external_tool': return 'TOOL';
			case 'build_tool': return 'BUILD';
			default: return type.toUpperCase();
		}
	}

	// Simple interaction arrows between roles based on active phase
	const interactions = $derived.by(() => {
		if (!activePhase || roles.length < 2) return [];
		const result: { from: number; to: number; label: string }[] = [];
		const actorIdx = roles.findIndex(r => r.id === activePhase.actor);
		const humanIdx = roles.findIndex(r => r.type === 'human');

		// Active actor receives from human
		if (humanIdx >= 0 && actorIdx >= 0 && humanIdx !== actorIdx) {
			result.push({ from: humanIdx, to: actorIdx, label: '需求' });
		}

		// If image gen exists and is not the active actor, active actor may delegate
		const genIdx = roles.findIndex(r => r.type === 'image_gen');
		if (genIdx >= 0 && actorIdx >= 0 && genIdx !== actorIdx) {
			if (activePhase.actor !== roles[genIdx]?.id) {
				result.push({ from: actorIdx, to: genIdx, label: 'Prompt' });
				result.push({ from: genIdx, to: actorIdx, label: '图片' });
			}
		}

		return result;
	});
</script>

<Panel id="role-interaction" title="ROLE INTERACTION" {loading} {error}>
	{#if !workflow}
		<div class="empty">No workflow data</div>
	{:else}
		<div class="roles-container">
			<div class="roles-row">
				{#each roles as role (role.id)}
					{@const isActive = activePhase?.actor === role.id}
					<div class="role-card" class:active={isActive} style="--role-color: {role.color}">
						<div class="role-emoji">{role.avatar}</div>
						<div class="role-name">{role.name}</div>
						<div class="role-type">{typeLabel(role.type)}</div>
						<div class="role-action">{role.current_action || 'Idle'}</div>
						<div class="role-resp">
							{#each role.responsibilities.slice(0, 3) as resp}
								<span class="resp-tag">{resp}</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<!-- Interaction arrows (simplified SVG) -->
			{#if interactions.length > 0}
				<div class="interactions">
					{#each interactions as inter}
						<div class="interaction-row">
							<span class="inter-from">{roles[inter.from]?.avatar}</span>
							<span class="inter-arrow">
								<span class="arrow-line"></span>
								<span class="arrow-label">{inter.label}</span>
								<span class="arrow-head">▸</span>
							</span>
							<span class="inter-to">{roles[inter.to]?.avatar}</span>
						</div>
					{/each}
				</div>
			{/if}

			{#if activePhase}
				<div class="active-phase-label">
					Active: <strong>{activePhase.name}</strong> ({activePhase.progress}%)
				</div>
			{:else}
				<div class="active-phase-label" style="color: var(--green)">All phases idle</div>
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

	.roles-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.roles-row {
		display: flex;
		gap: 0.4rem;
		justify-content: center;
	}

	.role-card {
		flex: 1;
		max-width: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		padding: 0.5rem 0.4rem;
		border: 1.5px solid var(--role-color);
		border-radius: 8px;
		background: var(--bg);
		opacity: 0.35;
		transition: opacity 0.3s, box-shadow 0.3s, transform 0.2s;
	}

	.role-card.active {
		opacity: 1;
		transform: translateY(-2px);
		box-shadow: 0 0 12px color-mix(in srgb, var(--role-color) 30%, transparent);
		animation: role-pulse 2.5s ease-in-out infinite;
	}

	@keyframes role-pulse {
		0%, 100% { box-shadow: 0 0 6px color-mix(in srgb, var(--role-color) 20%, transparent); }
		50% { box-shadow: 0 0 16px color-mix(in srgb, var(--role-color) 40%, transparent); }
	}

	.role-emoji { font-size: 1.8rem; }
	.role-name { font-size: 0.8rem; font-weight: 700; color: #ffffff; }

	.role-type {
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--text-muted);
		letter-spacing: 0.04em;
		padding: 0.05rem 0.3rem;
		border: 1px solid var(--border);
		border-radius: 3px;
	}

	.role-action {
		font-size: 0.7rem;
		color: var(--text-dim);
		text-align: center;
		min-height: 1.5em;
	}

	.role-resp {
		display: flex;
		flex-wrap: wrap;
		gap: 0.15rem;
		justify-content: center;
		margin-top: 0.15rem;
	}

	.resp-tag {
		font-size: 0.6rem;
		color: var(--text-muted);
		background: rgba(255, 255, 255, 0.04);
		padding: 0.05rem 0.2rem;
		border-radius: 2px;
	}

	/* Interactions */
	.interactions {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.3rem 0;
	}

	.interaction-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
	}

	.inter-from, .inter-to { font-size: 1rem; }

	.inter-arrow {
		display: flex;
		align-items: center;
		gap: 0.15rem;
	}

	.arrow-line {
		width: 30px;
		height: 0;
		border-top: 1px dashed var(--text-muted);
	}

	.arrow-label {
		font-size: 0.65rem;
		color: #ffffff;
		background: var(--surface);
		padding: 0 0.2rem;
	}

	.arrow-head {
		font-size: 0.6rem;
		color: var(--text-muted);
	}

	.active-phase-label {
		text-align: center;
		font-size: 0.75rem;
		color: #ffffff;
		padding-top: 0.25rem;
		border-top: 1px solid var(--border);
	}
</style>
