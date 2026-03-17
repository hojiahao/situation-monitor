<script lang="ts">
	import { onMount } from 'svelte';
	import { Header, Dashboard } from '$lib/components/layout';
	import { SettingsModal, MonitorFormModal, OnboardingModal } from '$lib/components/modals';
	import {
		NewsPanel,
		MarketsPanel,
		HeatmapPanel,
		CommoditiesPanel,
		CryptoPanel,
		MainCharPanel,
		CorrelationPanel,
		NarrativePanel,
		MonitorsPanel,
		MapPanel,
		WhalePanel,
		PolymarketPanel,
		ContractsPanel,
		LayoffsPanel,
		IntelPanel,
		SituationPanel,
		WorldLeadersPanel,
		PrinterPanel,
		FedPanel,
		WorkflowOverviewPanel,
		DependencyGraphPanel,
		TimelinePanel,
		RoleInteractionPanel,
		EventLogPanel
	} from '$lib/components/panels';
	import {
		news,
		markets,
		monitors,
		settings,
		refresh,
		allNewsItems,
		fedIndicators,
		fedNews,
		workflowStore
	} from '$lib/stores';
	import {
		fetchAllNews,
		fetchAllMarkets,
		fetchPolymarket,
		fetchWhaleTransactions,
		fetchGovContracts,
		fetchLayoffs,
		fetchWorldLeaders,
		fetchFedIndicators,
		fetchFedNews
	} from '$lib/api';
	import type { Prediction, WhaleTransaction, Contract, Layoff } from '$lib/api';
	import type { CustomMonitor, WorldLeader } from '$lib/types';
	import type { PanelId } from '$lib/config';
	import { MOTION_COMIC_WORKFLOW } from '$lib/config/workflow-demo';

	// Modal state
	let settingsOpen = $state(false);
	let monitorFormOpen = $state(false);
	let onboardingOpen = $state(false);
	let editingMonitor = $state<CustomMonitor | null>(null);

	// Misc panel data
	let predictions = $state<Prediction[]>([]);
	let whales = $state<WhaleTransaction[]>([]);
	let contracts = $state<Contract[]>([]);
	let layoffs = $state<Layoff[]>([]);
	let leaders = $state<WorldLeader[]>([]);
	let leadersLoading = $state(false);

	// Data fetching
	async function loadNews() {
		// Set loading for all categories
		const categories = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'] as const;
		categories.forEach((cat) => news.setLoading(cat, true));

		try {
			const data = await fetchAllNews();
			Object.entries(data).forEach(([category, items]) => {
				news.setItems(category as keyof typeof data, items);
			});
		} catch (error) {
			categories.forEach((cat) => news.setError(cat, String(error)));
		}
	}

	async function loadMarkets() {
		try {
			const data = await fetchAllMarkets();
			markets.setIndices(data.indices);
			markets.setSectors(data.sectors);
			markets.setCommodities(data.commodities);
			markets.setCrypto(data.crypto);
		} catch (error) {
			console.error('Failed to load markets:', error);
		}
	}

	async function loadMiscData() {
		try {
			const [predictionsData, whalesData, contractsData, layoffsData] = await Promise.all([
				fetchPolymarket(),
				fetchWhaleTransactions(),
				fetchGovContracts(),
				fetchLayoffs()
			]);
			predictions = predictionsData;
			whales = whalesData;
			contracts = contractsData;
			layoffs = layoffsData;
		} catch (error) {
			console.error('Failed to load misc data:', error);
		}
	}

	async function loadWorldLeaders() {
		if (!isPanelVisible('leaders')) return;
		leadersLoading = true;
		try {
			leaders = await fetchWorldLeaders();
		} catch (error) {
			console.error('Failed to load world leaders:', error);
		} finally {
			leadersLoading = false;
		}
	}

	async function loadFedData() {
		if (!isPanelVisible('fed')) return;
		fedIndicators.setLoading(true);
		fedNews.setLoading(true);
		try {
			const [indicatorsData, newsData] = await Promise.all([fetchFedIndicators(), fetchFedNews()]);
			fedIndicators.setData(indicatorsData);
			fedNews.setItems(newsData);
		} catch (error) {
			console.error('Failed to load Fed data:', error);
			fedIndicators.setError(String(error));
			fedNews.setError(String(error));
		}
	}

	// Refresh handlers
	async function handleRefresh() {
		refresh.startRefresh();
		try {
			await Promise.all([loadNews(), loadMarkets()]);
			refresh.endRefresh();
		} catch (error) {
			refresh.endRefresh([String(error)]);
		}
	}

	// Monitor handlers
	function handleCreateMonitor() {
		editingMonitor = null;
		monitorFormOpen = true;
	}

	function handleEditMonitor(monitor: CustomMonitor) {
		editingMonitor = monitor;
		monitorFormOpen = true;
	}

	function handleDeleteMonitor(id: string) {
		monitors.deleteMonitor(id);
	}

	function handleToggleMonitor(id: string) {
		monitors.toggleMonitor(id);
	}

	// Get panel visibility
	function isPanelVisible(id: PanelId): boolean {
		return $settings.enabled[id] !== false;
	}

	// Handle preset selection from onboarding
	function handleSelectPreset(presetId: string) {
		settings.applyPreset(presetId);
		onboardingOpen = false;
		// Refresh data after applying preset
		handleRefresh();
	}

	// Show onboarding again (called from settings)
	function handleReconfigure() {
		settingsOpen = false;
		settings.resetOnboarding();
		onboardingOpen = true;
	}

	// Poll CodePilot's workflow-status API for real-time workflow data
	const CODEPILOT_API = 'http://localhost:3000/api/workflow-status';
	let workflowPollInterval: ReturnType<typeof setInterval> | null = null;
	let hasRealWorkflow = false;

	async function pollWorkflowStatus() {
		try {
			const res = await fetch(CODEPILOT_API);
			if (!res.ok) throw new Error('not ok');
			const data = await res.json();
			if (data.workflow && data.workflow.meta && data.workflow.phases) {
				// Real workflow data from CodePilot — always use it
				workflowStore.setWorkflow(data.workflow);
				hasRealWorkflow = true;
			} else if (!hasRealWorkflow) {
				// CodePilot running but no active workflow — show demo so panels aren't blank
				workflowStore.setWorkflow(MOTION_COMIC_WORKFLOW);
			}
		} catch {
			// CodePilot not running — show demo so panels aren't blank
			if (!hasRealWorkflow) {
				workflowStore.setWorkflow(MOTION_COMIC_WORKFLOW);
			}
		}
	}

	function startWorkflowPolling() {
		// Initial fetch
		pollWorkflowStatus();
		// Poll every 2 seconds
		workflowPollInterval = setInterval(pollWorkflowStatus, 2000);
	}

	function stopWorkflowPolling() {
		if (workflowPollInterval) {
			clearInterval(workflowPollInterval);
			workflowPollInterval = null;
		}
	}

	// Initial load
	onMount(() => {
		// Check if first visit
		if (!settings.isOnboardingComplete()) {
			onboardingOpen = true;
		}

		// Load initial data and track as refresh
		async function initialLoad() {
			refresh.startRefresh();
			try {
				await Promise.all([
					loadNews(),
					loadMarkets(),
					loadMiscData(),
					loadWorldLeaders(),
					loadFedData()
				]);
				refresh.endRefresh();
			} catch (error) {
				refresh.endRefresh([String(error)]);
			}
		}
		initialLoad();
		refresh.setupAutoRefresh(handleRefresh);
		startWorkflowPolling();

		// Listen for messages from parent window (CodePilot iframe integration)
		function handleMessage(event: MessageEvent) {
			if (!event.data) return;

			// Switch preset (e.g., show only workflow panels)
			if (event.data.type === 'preset-switch' && event.data.presetId) {
				settings.applyPreset(event.data.presetId);
				onboardingOpen = false;
				return;
			}

			// Workflow data update
			if (event.data.type === 'workflow-update') {
				try {
					const wf = event.data.payload;
					if (wf && wf.meta && wf.phases) {
						workflowStore.setWorkflow(wf);
					}
				} catch (e) {
					console.error('[workflow] Failed to process postMessage:', e);
				}
			}
		}
		window.addEventListener('message', handleMessage);

		return () => {
			refresh.stopAutoRefresh();
			stopWorkflowPolling();
			window.removeEventListener('message', handleMessage);
		};
	});
</script>

<svelte:head>
	<title>Situation Monitor</title>
	<meta name="description" content="Real-time global situation monitoring dashboard" />
</svelte:head>

<div class="app">
	<Header onSettingsClick={() => (settingsOpen = true)} />

	<main class="main-content">
		<Dashboard>
			<!-- Workflow Panels -->
			{#if isPanelVisible('workflow-overview')}
				<div class="panel-slot map-slot">
					<WorkflowOverviewPanel />
				</div>
			{/if}

			{#if isPanelVisible('dependency-graph')}
				<div class="panel-slot map-slot">
					<DependencyGraphPanel />
				</div>
			{/if}

			<!-- Timeline + Role Interaction + Event Log: same row, aligned height -->
			<div class="panel-slot map-slot workflow-row">
				{#if isPanelVisible('timeline')}
					<div class="workflow-col" style="flex: 1;">
						<TimelinePanel />
					</div>
				{/if}
				{#if isPanelVisible('role-interaction')}
					<div class="workflow-col" style="flex: 1;">
						<RoleInteractionPanel />
					</div>
				{/if}
				{#if isPanelVisible('event-log')}
					<div class="workflow-col" style="flex: 1;">
						<EventLogPanel />
					</div>
				{/if}
			</div>

			<!-- Map Panel - Full width -->
			{#if isPanelVisible('map')}
				<div class="panel-slot map-slot">
					<MapPanel monitors={$monitors.monitors} />
				</div>
			{/if}

			<!-- News Panels -->
			{#if isPanelVisible('politics')}
				<div class="panel-slot">
					<NewsPanel category="politics" panelId="politics" title="Politics" />
				</div>
			{/if}

			{#if isPanelVisible('tech')}
				<div class="panel-slot">
					<NewsPanel category="tech" panelId="tech" title="Tech" />
				</div>
			{/if}

			{#if isPanelVisible('finance')}
				<div class="panel-slot">
					<NewsPanel category="finance" panelId="finance" title="Finance" />
				</div>
			{/if}

			{#if isPanelVisible('gov')}
				<div class="panel-slot">
					<NewsPanel category="gov" panelId="gov" title="Government" />
				</div>
			{/if}

			{#if isPanelVisible('ai')}
				<div class="panel-slot">
					<NewsPanel category="ai" panelId="ai" title="AI" />
				</div>
			{/if}

			<!-- Markets Panels -->
			{#if isPanelVisible('markets')}
				<div class="panel-slot">
					<MarketsPanel />
				</div>
			{/if}

			{#if isPanelVisible('heatmap')}
				<div class="panel-slot">
					<HeatmapPanel />
				</div>
			{/if}

			{#if isPanelVisible('commodities')}
				<div class="panel-slot">
					<CommoditiesPanel />
				</div>
			{/if}

			{#if isPanelVisible('crypto')}
				<div class="panel-slot">
					<CryptoPanel />
				</div>
			{/if}

			<!-- Analysis Panels -->
			{#if isPanelVisible('mainchar')}
				<div class="panel-slot">
					<MainCharPanel />
				</div>
			{/if}

			{#if isPanelVisible('correlation')}
				<div class="panel-slot">
					<CorrelationPanel news={$allNewsItems} />
				</div>
			{/if}

			{#if isPanelVisible('narrative')}
				<div class="panel-slot">
					<NarrativePanel news={$allNewsItems} />
				</div>
			{/if}

			<!-- Intel Panel -->
			{#if isPanelVisible('intel')}
				<div class="panel-slot">
					<IntelPanel />
				</div>
			{/if}

			<!-- Fed Panel -->
			{#if isPanelVisible('fed')}
				<div class="panel-slot">
					<FedPanel />
				</div>
			{/if}

			<!-- World Leaders Panel -->
			{#if isPanelVisible('leaders')}
				<div class="panel-slot">
					<WorldLeadersPanel {leaders} loading={leadersLoading} />
				</div>
			{/if}

			<!-- Situation Panels -->
			{#if isPanelVisible('venezuela')}
				<div class="panel-slot">
					<SituationPanel
						panelId="venezuela"
						config={{
							title: 'Venezuela Watch',
							subtitle: 'Humanitarian crisis monitoring',
							criticalKeywords: ['maduro', 'caracas', 'venezuela', 'guaido']
						}}
						news={$allNewsItems.filter(
							(n) =>
								n.title.toLowerCase().includes('venezuela') ||
								n.title.toLowerCase().includes('maduro')
						)}
					/>
				</div>
			{/if}

			{#if isPanelVisible('greenland')}
				<div class="panel-slot">
					<SituationPanel
						panelId="greenland"
						config={{
							title: 'Greenland Watch',
							subtitle: 'Arctic geopolitics monitoring',
							criticalKeywords: ['greenland', 'arctic', 'nuuk', 'denmark']
						}}
						news={$allNewsItems.filter(
							(n) =>
								n.title.toLowerCase().includes('greenland') ||
								n.title.toLowerCase().includes('arctic')
						)}
					/>
				</div>
			{/if}

			{#if isPanelVisible('iran')}
				<div class="panel-slot">
					<SituationPanel
						panelId="iran"
						config={{
							title: 'Iran Crisis',
							subtitle: 'Revolution protests, regime instability & nuclear program',
							criticalKeywords: [
								'protest',
								'uprising',
								'revolution',
								'crackdown',
								'killed',
								'nuclear',
								'strike',
								'attack',
								'irgc',
								'khamenei'
							]
						}}
						news={$allNewsItems.filter(
							(n) =>
								n.title.toLowerCase().includes('iran') ||
								n.title.toLowerCase().includes('tehran') ||
								n.title.toLowerCase().includes('irgc')
						)}
					/>
				</div>
			{/if}

			<!-- Placeholder panels for additional data sources -->
			{#if isPanelVisible('whales')}
				<div class="panel-slot">
					<WhalePanel {whales} />
				</div>
			{/if}

			{#if isPanelVisible('polymarket')}
				<div class="panel-slot">
					<PolymarketPanel {predictions} />
				</div>
			{/if}

			{#if isPanelVisible('contracts')}
				<div class="panel-slot">
					<ContractsPanel {contracts} />
				</div>
			{/if}

			{#if isPanelVisible('layoffs')}
				<div class="panel-slot">
					<LayoffsPanel {layoffs} />
				</div>
			{/if}

			<!-- Money Printer Panel -->
			{#if isPanelVisible('printer')}
				<div class="panel-slot">
					<PrinterPanel />
				</div>
			{/if}

			<!-- Custom Monitors (always last) -->
			{#if isPanelVisible('monitors')}
				<div class="panel-slot">
					<MonitorsPanel
						monitors={$monitors.monitors}
						matches={$monitors.matches}
						onCreateMonitor={handleCreateMonitor}
						onEditMonitor={handleEditMonitor}
						onDeleteMonitor={handleDeleteMonitor}
						onToggleMonitor={handleToggleMonitor}
					/>
				</div>
			{/if}
		</Dashboard>
	</main>

	<!-- Modals -->
	<SettingsModal
		open={settingsOpen}
		onClose={() => (settingsOpen = false)}
		onReconfigure={handleReconfigure}
	/>
	<MonitorFormModal
		open={monitorFormOpen}
		onClose={() => (monitorFormOpen = false)}
		editMonitor={editingMonitor}
	/>
	<OnboardingModal open={onboardingOpen} onSelectPreset={handleSelectPreset} />
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg);
	}

	.main-content {
		flex: 1;
		padding: 0.5rem;
		overflow-y: auto;
	}

	.map-slot {
		column-span: all;
		margin-bottom: 0.5rem;
	}

	.workflow-row {
		display: flex;
		gap: 0.5rem;
		align-items: stretch;
	}

	.workflow-col {
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.workflow-col > :global(.panel) {
		flex: 1;
	}

	@media (max-width: 768px) {
		.main-content {
			padding: 0.25rem;
		}
	}
</style>
