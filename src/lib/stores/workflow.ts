/**
 * Workflow visualization store
 */
import { writable, derived } from 'svelte/store';
import type { Workflow, WorkflowEvent, PhaseStatus, AssetStatus } from '$lib/types';

export interface WorkflowStoreState {
	currentWorkflow: Workflow | null;
	loading: boolean;
	error: string | null;
}

function createWorkflowStore() {
	const { subscribe, set, update } = writable<WorkflowStoreState>({
		currentWorkflow: null,
		loading: false,
		error: null
	});

	return {
		subscribe,

		setWorkflow(workflow: Workflow) {
			update(s => ({ ...s, currentWorkflow: workflow, loading: false, error: null }));
		},

		setLoading(loading: boolean) {
			update(s => ({ ...s, loading }));
		},

		setError(error: string | null) {
			update(s => ({ ...s, error, loading: false }));
		},

		updatePhaseStatus(phaseId: string, status: PhaseStatus, progress?: number) {
			update(s => {
				if (!s.currentWorkflow) return s;
				const phases = s.currentWorkflow.phases.map(p =>
					p.id === phaseId
						? { ...p, status, progress: progress ?? p.progress, ...(status === 'in_progress' && !p.started_at ? { started_at: new Date().toISOString() } : {}), ...(status === 'completed' ? { completed_at: new Date().toISOString(), progress: 100 } : {}) }
						: p
				);
				const totalProgress = Math.round(phases.reduce((sum, p) => sum + p.progress, 0) / phases.length);
				return {
					...s,
					currentWorkflow: {
						...s.currentWorkflow,
						phases,
						meta: { ...s.currentWorkflow.meta, progress: totalProgress }
					}
				};
			});
		},

		updateAssetStatus(assetId: string, status: AssetStatus) {
			update(s => {
				if (!s.currentWorkflow) return s;
				const assets = s.currentWorkflow.assets.map(a =>
					a.id === assetId ? { ...a, status } : a
				);
				return { ...s, currentWorkflow: { ...s.currentWorkflow, assets } };
			});
		},

		addEvent(event: WorkflowEvent) {
			update(s => {
				if (!s.currentWorkflow) return s;
				return {
					...s,
					currentWorkflow: {
						...s.currentWorkflow,
						events: [event, ...s.currentWorkflow.events]
					}
				};
			});
		},

		reset() {
			set({ currentWorkflow: null, loading: false, error: null });
		},

		updateFromEvent(event: { type: string; phase_id?: string; data?: Record<string, unknown> }) {
			update(s => {
				if (!s.currentWorkflow) return s;
				const wf = { ...s.currentWorkflow };

				if (event.type === 'phase_status' && event.phase_id && event.data) {
					wf.phases = wf.phases.map(p =>
						p.id === event.phase_id ? { ...p, ...event.data } : p
					);
					wf.meta = {
						...wf.meta,
						progress: Math.round(wf.phases.reduce((sum, p) => sum + p.progress, 0) / wf.phases.length)
					};
				}

				if (event.type === 'add_event' && event.data) {
					wf.events = [event.data as unknown as WorkflowEvent, ...wf.events];
				}

				return { ...s, currentWorkflow: wf };
			});
		}
	};
}

export const workflowStore = createWorkflowStore();

// Derived stores
export const workflowPhases = derived(workflowStore, $s =>
	$s.currentWorkflow?.phases.sort((a, b) => a.order - b.order) ?? []
);

export const workflowAssets = derived(workflowStore, $s =>
	$s.currentWorkflow?.assets ?? []
);

export const workflowRoles = derived(workflowStore, $s =>
	$s.currentWorkflow?.roles ?? []
);

export const workflowEvents = derived(workflowStore, $s =>
	$s.currentWorkflow?.events ?? []
);

export const workflowProgress = derived(workflowStore, $s =>
	$s.currentWorkflow?.meta.progress ?? 0
);

export const workflowDependencies = derived(workflowStore, $s =>
	$s.currentWorkflow?.dependencies ?? []
);
