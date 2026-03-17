<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { workflowStore, workflowAssets, workflowDependencies, workflowPhases } from '$lib/stores';
	import type { WorkflowAsset } from '$lib/types';

	const assets = $derived($workflowAssets);
	const deps = $derived($workflowDependencies);
	const phases = $derived($workflowPhases);
	const workflow = $derived($workflowStore.currentWorkflow);
	const loading = $derived($workflowStore.loading);
	const error = $derived($workflowStore.error);

	let container: HTMLDivElement;
	let tooltip = $state({ visible: false, x: 0, y: 0, asset: null as WorkflowAsset | null });
	let hoveredNodeId: string | null = null; void hoveredNodeId;

	const PHASE_COLOR_PALETTE = [
		'#4488ff', '#8844ff', '#44ddaa', '#ff8844', '#ff44aa',
		'#44aaff', '#aaff44', '#ff4444', '#44ff88', '#ff44ff',
		'#ffaa44', '#4444ff',
	];

	const SPECIAL_GROUP_COLOR: Record<string, string> = {
		input: '#888888',
		external: '#888888',
	};

	function getPhaseColor(group: string, allPhaseIds: string[]): string {
		if (SPECIAL_GROUP_COLOR[group]) return SPECIAL_GROUP_COLOR[group];
		const idx = allPhaseIds.indexOf(group);
		if (idx >= 0) return PHASE_COLOR_PALETTE[idx % PHASE_COLOR_PALETTE.length];
		return '#666';
	}

	const EDGE_DASH: Record<string, string> = {
		produces: '',
		requires: '6,4',
		references: '2,3',
		triggers: '8,4,2,4',
	};

	const allPhaseIds = $derived(phases.map(p => p.id));

	function phaseColor(group: string): string {
		return getPhaseColor(group, allPhaseIds);
	}

	function nodeRadius(assetId: string): number {
		const count = deps.filter(d => d.from === assetId || d.to === assetId).length;
		return Math.min(20, Math.max(8, 6 + count * 2));
	}

	function phaseXTarget(group: string, width: number): number {
		if (group === 'input' || group === 'external') {
			return width * 0.05;
		}
		// Use the phase's position in the ordered phases list
		const idx = allPhaseIds.indexOf(group);
		if (idx < 0) return width / 2;
		const total = Math.max(allPhaseIds.length, 1);
		return (width * 0.1) + ((idx + 1) / (total + 1)) * (width * 0.8);
	}

	async function initGraph() {
		if (!container || assets.length === 0) return;

		const d3 = await import('d3');
		const width = container.clientWidth || 600;
		const height = Math.max(400, container.clientHeight || 400);

		// Clear previous
		d3.select(container).selectAll('*').remove();

		const svg = d3.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.style('background', 'transparent');

		// Defs: arrowheads
		const defs = svg.append('defs');
		['produces', 'requires', 'references', 'triggers'].forEach(type => {
			defs.append('marker')
				.attr('id', `arrow-${type}`)
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 22)
				.attr('markerWidth', 6)
				.attr('markerHeight', 6)
				.attr('orient', 'auto')
				.append('path')
				.attr('d', 'M0,-4L10,0L0,4')
				.attr('fill', '#ffffff');
		});

		// Drop shadow filter
		const filter = defs.append('filter').attr('id', 'glow');
		filter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'blur');
		filter.append('feMerge').selectAll('feMergeNode')
			.data(['blur', 'SourceGraphic']).enter()
			.append('feMergeNode').attr('in', (d: string) => d);

		const g = svg.append('g');

		// Zoom
		const zoom = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.3, 4])
			.on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
				g.attr('transform', event.transform.toString());
			});
		svg.call(zoom);

		// Nodes & links data
		interface NodeDatum extends d3.SimulationNodeDatum {
			id: string;
			name: string;
			format: string;
			phase_group: string;
			status: string;
			type: string;
			r: number;
		}

		interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
			depType: string;
			label?: string;
		}

		const nodes: NodeDatum[] = assets.map(a => ({
			id: a.id,
			name: a.name,
			format: a.format,
			phase_group: a.phase_group,
			status: a.status,
			type: a.type,
			r: nodeRadius(a.id),
		}));

		const nodeMap = new Map(nodes.map(n => [n.id, n]));
		const links: LinkDatum[] = deps
			.filter(d => nodeMap.has(d.from) && nodeMap.has(d.to))
			.map(d => ({
				source: d.from,
				target: d.to,
				depType: d.type,
				label: d.label,
			}));

		// Simulation
		const simulation = d3.forceSimulation<NodeDatum>(nodes)
			.force('link', d3.forceLink<NodeDatum, LinkDatum>(links).id(d => d.id).distance(90))
			.force('charge', d3.forceManyBody().strength(-250))
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force('collision', d3.forceCollide<NodeDatum>().radius(d => d.r + 5))
			.force('x', d3.forceX<NodeDatum>(d => phaseXTarget(d.phase_group, width)).strength(0.12))
			.force('y', d3.forceY(height / 2).strength(0.05));

		// Links
		const link = g.append('g')
			.selectAll('line')
			.data(links)
			.enter()
			.append('line')
			.attr('stroke', '#ffffff')
			.attr('stroke-opacity', 0.5)
			.attr('stroke-width', 1.8)
			.attr('stroke-dasharray', (d: LinkDatum) => EDGE_DASH[d.depType] || '')
			.attr('marker-end', (d: LinkDatum) => `url(#arrow-${d.depType})`);

		// Nodes group
		const node = g.append('g')
			.selectAll('g')
			.data(nodes)
			.enter()
			.append('g')
			.attr('cursor', 'pointer')
			.call(d3.drag<SVGGElement, NodeDatum>()
				.on('start', (event: d3.D3DragEvent<SVGGElement, NodeDatum, NodeDatum>, d: NodeDatum) => {
					if (!event.active) simulation.alphaTarget(0.3).restart();
					d.fx = d.x;
					d.fy = d.y;
				})
				.on('drag', (event: d3.D3DragEvent<SVGGElement, NodeDatum, NodeDatum>, d: NodeDatum) => {
					d.fx = event.x;
					d.fy = event.y;
				})
				.on('end', (event: d3.D3DragEvent<SVGGElement, NodeDatum, NodeDatum>, d: NodeDatum) => {
					if (!event.active) simulation.alphaTarget(0);
					d.fx = null;
					d.fy = null;
				})
			);

		// Node circles
		node.append('circle')
			.attr('r', (d: NodeDatum) => d.r)
			.attr('fill', (d: NodeDatum) => d.status === 'pending' ? 'transparent' : phaseColor(d.phase_group))
			.attr('stroke', (d: NodeDatum) => phaseColor(d.phase_group))
			.attr('stroke-width', (d: NodeDatum) => d.status === 'pending' ? 2 : 1)
			.attr('stroke-dasharray', (d: NodeDatum) => d.status === 'pending' ? '3,3' : '')
			.attr('filter', 'url(#glow)')
			.attr('opacity', 0.9);

		// Node labels
		node.append('text')
			.attr('dy', (d: NodeDatum) => d.r + 14)
			.attr('text-anchor', 'middle')
			.attr('fill', '#ffffff')
			.attr('font-size', '0.7rem')
			.text((d: NodeDatum) => `${d.name}`);

		node.append('text')
			.attr('dy', (d: NodeDatum) => d.r + 26)
			.attr('text-anchor', 'middle')
			.attr('fill', '#cccccc')
			.attr('font-size', '0.6rem')
			.text((d: NodeDatum) => `[${d.format}]`);

		// Hover effects
		node.on('mouseenter', (event: MouseEvent, d: NodeDatum) => {
			hoveredNodeId = d.id;
			const connectedIds = new Set<string>();
			connectedIds.add(d.id);
			links.forEach(l => {
				const src = String(typeof l.source === 'object' ? (l.source as NodeDatum).id : l.source);
				const tgt = String(typeof l.target === 'object' ? (l.target as NodeDatum).id : l.target);
				if (src === d.id) connectedIds.add(tgt);
				if (tgt === d.id) connectedIds.add(src);
			});

			node.each(function(n: NodeDatum) {
				const el = d3.select(this);
				const connected = connectedIds.has(n.id);
				el.select('circle').attr('opacity', connected ? 1 : 0.15);
				el.selectAll('text').attr('opacity', connected ? 1 : 0.15);
			});
			link.attr('stroke-opacity', (l: LinkDatum) => {
				const src = typeof l.source === 'object' ? (l.source as NodeDatum).id : l.source;
				const tgt = typeof l.target === 'object' ? (l.target as NodeDatum).id : l.target;
				return src === d.id || tgt === d.id ? 0.9 : 0.05;
			});

			const asset = assets.find(a => a.id === d.id);
			if (asset) {
				const rect = container.getBoundingClientRect();
				tooltip = { visible: true, x: event.clientX - rect.left + 10, y: event.clientY - rect.top - 10, asset };
			}
		})
		.on('mousemove', (event: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			tooltip = { ...tooltip, x: event.clientX - rect.left + 10, y: event.clientY - rect.top - 10 };
		})
		.on('mouseleave', () => {
			hoveredNodeId = null;
			tooltip = { visible: false, x: 0, y: 0, asset: null };
			node.each(function() {
				const el = d3.select(this);
				el.select('circle').attr('opacity', 0.9);
				el.selectAll('text').attr('opacity', 1);
			});
			link.attr('stroke-opacity', 0.5);
		});

		// Tick
		simulation.on('tick', () => {
			link
				.attr('x1', (d: LinkDatum) => (d.source as NodeDatum).x!)
				.attr('y1', (d: LinkDatum) => (d.source as NodeDatum).y!)
				.attr('x2', (d: LinkDatum) => (d.target as NodeDatum).x!)
				.attr('y2', (d: LinkDatum) => (d.target as NodeDatum).y!);

			node.attr('transform', (d: NodeDatum) => `translate(${d.x},${d.y})`);
		});
	}

	// Only rebuild the graph when asset/dependency data actually changes,
	// not on every poll cycle that sets the same data.
	let prevGraphKey = '';
	$effect(() => {
		if (assets.length > 0 && container) {
			const key = JSON.stringify(assets.map(a => a.id + a.status)) + JSON.stringify(deps.map(d => d.from + d.to));
			if (key !== prevGraphKey) {
				prevGraphKey = key;
				initGraph();
			}
		}
	});
</script>

<Panel id="dependency-graph" title="ASSET DEPENDENCIES" {loading} {error}>
	<!-- Track hover state: {hoveredNodeId} -->
	{#if !workflow}
		<div class="empty">No workflow data</div>
	{:else}
		<div class="graph-wrap">
			<!-- Legend -->
			<div class="legend">
				<div class="legend-title">PHASES</div>
				{#each phases as phase}
					<div class="legend-item">
						<span class="legend-dot" style="background: {phaseColor(phase.id)}"></span>
						<span>{phase.name}</span>
					</div>
				{/each}
				<div class="legend-title" style="margin-top: 0.3rem">EDGES</div>
				<div class="legend-item"><span class="legend-line solid"></span><span>produces</span></div>
				<div class="legend-item"><span class="legend-line dashed"></span><span>requires</span></div>
				<div class="legend-item"><span class="legend-line dotted"></span><span>references</span></div>
			</div>

			<div bind:this={container} class="graph-container"></div>

			<!-- Tooltip -->
			{#if tooltip.visible && tooltip.asset}
				<div class="tooltip" style="left: {tooltip.x}px; top: {tooltip.y}px">
					<div class="tt-name">{tooltip.asset.name}</div>
					<div class="tt-row"><span class="tt-label">Type:</span> {tooltip.asset.type}</div>
					<div class="tt-row"><span class="tt-label">Format:</span> {tooltip.asset.format}</div>
					<div class="tt-row"><span class="tt-label">Status:</span>
						<span style="color: {tooltip.asset.status === 'ready' ? 'var(--green)' : tooltip.asset.status === 'error' ? 'var(--red)' : 'var(--text-dim)'}">
							{tooltip.asset.status}
						</span>
					</div>
					{#if tooltip.asset.size}
						<div class="tt-row"><span class="tt-label">Size:</span> {tooltip.asset.size}</div>
					{/if}
				</div>
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

	.graph-wrap {
		position: relative;
		min-height: 400px;
	}

	.graph-container {
		width: 100%;
		min-height: 400px;
	}

	.legend {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		z-index: 10;
		background: rgba(10, 10, 10, 0.9);
		border: 1px solid var(--border-light);
		border-radius: 6px;
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		color: #ffffff;
	}

	.legend-title {
		font-weight: 700;
		font-size: 0.8rem;
		color: #ffffff;
		letter-spacing: 0.06em;
		margin-bottom: 0.25rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.1rem 0;
		font-size: 0.75rem;
	}

	.legend-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-line {
		width: 20px;
		height: 0;
		border-top: 2px solid #ffffff;
		flex-shrink: 0;
	}

	.legend-line.dashed { border-top-style: dashed; }
	.legend-line.dotted { border-top-style: dotted; }

	.tooltip {
		position: absolute;
		z-index: 20;
		background: rgba(20, 20, 20, 0.95);
		border: 1px solid var(--border-light);
		border-radius: 4px;
		padding: 0.4rem 0.5rem;
		pointer-events: none;
		min-width: 120px;
	}

	.tt-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: #ffffff;
		margin-bottom: 0.2rem;
	}

	.tt-row {
		font-size: 0.7rem;
		color: var(--text-dim);
		padding: 0.05rem 0;
	}

	.tt-label {
		color: var(--text-muted);
	}
</style>
