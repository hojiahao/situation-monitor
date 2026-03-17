/**
 * Workflow data loading API
 */
import type { Workflow } from '$lib/types';
import { DEMO_WORKFLOWS } from '$lib/config/workflow-demo';

export async function loadDemoWorkflow(name: keyof typeof DEMO_WORKFLOWS): Promise<Workflow> {
	return DEMO_WORKFLOWS[name];
}

export async function loadWorkflowFromUrl(url: string): Promise<Workflow> {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Failed to fetch workflow: ${response.statusText}`);
	return response.json();
}

export function loadWorkflowFromJson(jsonStr: string): Workflow {
	return JSON.parse(jsonStr);
}
