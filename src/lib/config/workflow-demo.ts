/**
 * Demo workflow data for visualization testing
 */
import type { Workflow } from '$lib/types';

export const MOTION_COMIC_WORKFLOW: Workflow = {
	meta: {
		name: 'AI觉醒 — 科幻短篇漫剧',
		version: '1.0',
		description: '使用 Claude + Gemini 制作科幻主题漫剧视频，含分镜、配音、动效、BGM',
		estimated_duration: '3-5h',
		output_type: '漫剧视频 MP4',
		status: 'in_progress',
		progress: 48,
		started_at: '2026-03-13T10:00:00Z',
		source_skill: 'comic-generation'
	},
	roles: [
		{
			id: 'human',
			name: '用户 / 导演',
			type: 'human',
			avatar: '🧑',
			color: '#4488ff',
			responsibilities: ['提供需求', '审核质量', '风格指导'],
			current_action: '等待镜头画面生成'
		},
		{
			id: 'claude',
			name: 'Claude (编剧/导演)',
			type: 'ai_agent',
			avatar: '🤖',
			color: '#ff8844',
			responsibilities: ['剧本撰写', '分镜脚本', '配音文稿', '视频合成指令'],
			current_action: '编写第8镜配音台词'
		},
		{
			id: 'gemini',
			name: 'Gemini (画师)',
			type: 'image_gen',
			avatar: '🎨',
			color: '#44ff88',
			responsibilities: ['角色设计', '镜头画面生成', '风格一致性'],
			current_action: '渲染第8镜画面'
		}
	],
	phases: [
		{
			id: 'p1',
			name: '剧本创作',
			description: '故事大纲、分场剧本、角色小传、对白',
			actor: 'claude',
			status: 'completed',
			progress: 100,
			inputs: ['user_req', 'style_ref'],
			outputs: ['story_outline', 'screenplay', 'dialogue_script'],
			quality_gate: '剧情完整、节奏紧凑、对白自然',
			on_fail: '重写剧本',
			started_at: '2026-03-13T10:00:00Z',
			completed_at: '2026-03-13T10:18:00Z',
			duration_ms: 1080000,
			order: 1
		},
		{
			id: 'p2',
			name: '角色与美术',
			description: '角色三视图、表情库、场景概念图',
			actor: 'gemini',
			status: 'completed',
			progress: 100,
			inputs: ['story_outline', 'style_ref'],
			outputs: ['char_ref_sheets', 'expression_lib', 'scene_concepts'],
			quality_gate: '角色辨识度高、风格统一',
			on_fail: '调整 Prompt 重新生成',
			started_at: '2026-03-13T10:18:00Z',
			completed_at: '2026-03-13T10:40:00Z',
			duration_ms: 1320000,
			order: 2
		},
		{
			id: 'p3',
			name: '分镜脚本',
			description: '逐镜头规划：构图、景别、运镜、时长',
			actor: 'claude',
			status: 'completed',
			progress: 100,
			inputs: ['screenplay', 'dialogue_script', 'char_ref_sheets', 'scene_concepts'],
			outputs: ['storyboard', 'shot_list', 'camera_moves'],
			quality_gate: '镜头逻辑通顺、节奏合理',
			on_fail: '调整镜头顺序',
			started_at: '2026-03-13T10:40:00Z',
			completed_at: '2026-03-13T10:58:00Z',
			duration_ms: 1080000,
			order: 3
		},
		{
			id: 'p4',
			name: '镜头画面生成',
			description: '按分镜逐帧生成关键画面，保持角色一致',
			actor: 'gemini',
			status: 'in_progress',
			progress: 55,
			inputs: ['storyboard', 'shot_list', 'char_ref_sheets', 'expression_lib', 'scene_concepts'],
			outputs: ['shot_frames'],
			quality_gate: '角色一致、构图匹配分镜、无畸变',
			on_fail: '精修 Prompt 重新生成',
			started_at: '2026-03-13T10:58:00Z',
			order: 4
		},
		{
			id: 'p5',
			name: '配音与音效',
			description: 'TTS 配音、音效设计、BGM 选配',
			actor: 'claude',
			status: 'pending',
			progress: 0,
			inputs: ['dialogue_script', 'shot_list', 'shot_frames'],
			outputs: ['voiceover_tracks', 'sfx_tracks', 'bgm_track'],
			quality_gate: '配音节奏匹配画面、音量均衡',
			on_fail: '重新生成配音片段',
			order: 5
		},
		{
			id: 'p6',
			name: '动效与合成',
			description: '镜头运动、转场特效、字幕叠加',
			actor: 'claude',
			status: 'pending',
			progress: 0,
			inputs: ['shot_frames', 'camera_moves', 'storyboard'],
			outputs: ['animated_shots', 'subtitle_layer'],
			quality_gate: '运镜流畅、转场自然',
			on_fail: '调整关键帧',
			order: 6
		},
		{
			id: 'p7',
			name: '视频导出',
			description: '音视频混合、最终渲染、多格式导出',
			actor: 'claude',
			status: 'pending',
			progress: 0,
			inputs: ['animated_shots', 'voiceover_tracks', 'sfx_tracks', 'bgm_track', 'subtitle_layer'],
			outputs: ['final_video', 'preview_gif'],
			quality_gate: '音画同步、码率达标、无花屏',
			on_fail: '重新渲染',
			order: 7
		}
	],
	assets: [
		{ id: 'user_req', name: '用户需求', type: 'document', format: 'text', produced_by: 'external', consumed_by: ['p1'], status: 'ready', phase_group: 'input' },
		{ id: 'style_ref', name: '风格参考', type: 'image', format: 'PNG', produced_by: 'external', consumed_by: ['p1', 'p2'], status: 'ready', phase_group: 'input' },
		{ id: 'story_outline', name: '故事大纲', type: 'document', format: 'MD', produced_by: 'p1', consumed_by: ['p2', 'p3'], status: 'ready', phase_group: 'p1' },
		{ id: 'screenplay', name: '分场剧本', type: 'document', format: 'MD', produced_by: 'p1', consumed_by: ['p3'], status: 'ready', phase_group: 'p1' },
		{ id: 'dialogue_script', name: '对白脚本', type: 'document', format: 'MD', produced_by: 'p1', consumed_by: ['p3', 'p5'], status: 'ready', phase_group: 'p1' },
		{ id: 'char_ref_sheets', name: '角色三视图', type: 'image', format: 'PNG', produced_by: 'p2', consumed_by: ['p3', 'p4'], status: 'ready', size: '4.2MB', phase_group: 'p2' },
		{ id: 'expression_lib', name: '表情库', type: 'image', format: 'PNG set', produced_by: 'p2', consumed_by: ['p4'], status: 'ready', size: '8.1MB', phase_group: 'p2' },
		{ id: 'scene_concepts', name: '场景概念图', type: 'image', format: 'PNG', produced_by: 'p2', consumed_by: ['p3', 'p4'], status: 'ready', size: '6.3MB', phase_group: 'p2' },
		{ id: 'storyboard', name: '分镜脚本', type: 'document', format: 'MD+IMG', produced_by: 'p3', consumed_by: ['p4', 'p6'], status: 'ready', phase_group: 'p3' },
		{ id: 'shot_list', name: '镜头表', type: 'document', format: 'MD', produced_by: 'p3', consumed_by: ['p4', 'p5'], status: 'ready', phase_group: 'p3' },
		{ id: 'camera_moves', name: '运镜指令', type: 'document', format: 'JSON', produced_by: 'p3', consumed_by: ['p6'], status: 'ready', phase_group: 'p3' },
		{ id: 'shot_frames', name: '镜头画面', type: 'image', format: 'PNG 2K', produced_by: 'p4', consumed_by: ['p5', 'p6'], status: 'generating', size: '~30MB', phase_group: 'p4' },
		{ id: 'voiceover_tracks', name: '配音音轨', type: 'audio', format: 'WAV', produced_by: 'p5', consumed_by: ['p7'], status: 'pending', phase_group: 'p5' },
		{ id: 'sfx_tracks', name: '音效素材', type: 'audio', format: 'WAV', produced_by: 'p5', consumed_by: ['p7'], status: 'pending', phase_group: 'p5' },
		{ id: 'bgm_track', name: '背景音乐', type: 'audio', format: 'MP3', produced_by: 'p5', consumed_by: ['p7'], status: 'pending', phase_group: 'p5' },
		{ id: 'animated_shots', name: '动效镜头', type: 'video', format: 'MP4', produced_by: 'p6', consumed_by: ['p7'], status: 'pending', phase_group: 'p6' },
		{ id: 'subtitle_layer', name: '字幕层', type: 'data', format: 'SRT', produced_by: 'p6', consumed_by: ['p7'], status: 'pending', phase_group: 'p6' },
		{ id: 'final_video', name: '最终视频', type: 'video', format: 'MP4 1080p', produced_by: 'p7', consumed_by: [], status: 'pending', phase_group: 'p7' },
		{ id: 'preview_gif', name: '预览GIF', type: 'image', format: 'GIF', produced_by: 'p7', consumed_by: [], status: 'pending', phase_group: 'p7' }
	],
	dependencies: [
		{ from: 'user_req', to: 'story_outline', type: 'produces' },
		{ from: 'style_ref', to: 'char_ref_sheets', type: 'references' },
		{ from: 'story_outline', to: 'screenplay', type: 'produces' },
		{ from: 'story_outline', to: 'dialogue_script', type: 'produces' },
		{ from: 'story_outline', to: 'char_ref_sheets', type: 'triggers' },
		{ from: 'style_ref', to: 'scene_concepts', type: 'references' },
		{ from: 'story_outline', to: 'scene_concepts', type: 'triggers' },
		{ from: 'char_ref_sheets', to: 'expression_lib', type: 'produces' },
		{ from: 'screenplay', to: 'storyboard', type: 'produces' },
		{ from: 'dialogue_script', to: 'shot_list', type: 'requires' },
		{ from: 'scene_concepts', to: 'storyboard', type: 'references' },
		{ from: 'storyboard', to: 'camera_moves', type: 'produces' },
		{ from: 'char_ref_sheets', to: 'shot_frames', type: 'references' },
		{ from: 'expression_lib', to: 'shot_frames', type: 'references' },
		{ from: 'scene_concepts', to: 'shot_frames', type: 'references' },
		{ from: 'storyboard', to: 'shot_frames', type: 'requires' },
		{ from: 'shot_list', to: 'shot_frames', type: 'requires' },
		{ from: 'dialogue_script', to: 'voiceover_tracks', type: 'requires' },
		{ from: 'shot_list', to: 'sfx_tracks', type: 'requires' },
		{ from: 'shot_frames', to: 'animated_shots', type: 'requires' },
		{ from: 'camera_moves', to: 'animated_shots', type: 'requires' },
		{ from: 'storyboard', to: 'subtitle_layer', type: 'requires' },
		{ from: 'animated_shots', to: 'final_video', type: 'requires' },
		{ from: 'voiceover_tracks', to: 'final_video', type: 'requires' },
		{ from: 'sfx_tracks', to: 'final_video', type: 'requires' },
		{ from: 'bgm_track', to: 'final_video', type: 'requires' },
		{ from: 'subtitle_layer', to: 'final_video', type: 'requires' },
		{ from: 'final_video', to: 'preview_gif', type: 'produces' }
	],
	events: [
		{ id: 'e1', timestamp: '2026-03-13T10:00:00Z', phase_id: 'p1', type: 'phase_start', message: '开始剧本创作' },
		{ id: 'e2', timestamp: '2026-03-13T10:08:00Z', phase_id: 'p1', type: 'asset_created', message: '故事大纲完成 — 三幕结构：诞生→觉醒→抉择' },
		{ id: 'e3', timestamp: '2026-03-13T10:14:00Z', phase_id: 'p1', type: 'asset_created', message: '分场剧本+对白脚本完成，共12场' },
		{ id: 'e4', timestamp: '2026-03-13T10:18:00Z', phase_id: 'p1', type: 'phase_complete', message: '剧本创作完成，通过质量门' },
		{ id: 'e5', timestamp: '2026-03-13T10:18:00Z', phase_id: 'p2', type: 'phase_start', message: '开始角色与美术设计 — 主角 ARIA-7' },
		{ id: 'e6', timestamp: '2026-03-13T10:25:00Z', phase_id: 'p2', type: 'asset_created', message: 'ARIA-7 三视图生成完成' },
		{ id: 'e7', timestamp: '2026-03-13T10:30:00Z', phase_id: 'p2', type: 'retry', message: '表情库风格不一致，调整 Prompt 重试', details: '增加 style reference 权重，固定 seed' },
		{ id: 'e8', timestamp: '2026-03-13T10:35:00Z', phase_id: 'p2', type: 'asset_created', message: '场景概念图完成：实验室、废墟城市、数据空间' },
		{ id: 'e9', timestamp: '2026-03-13T10:40:00Z', phase_id: 'p2', type: 'phase_complete', message: '角色美术完成：三视图+表情库+3张场景概念' },
		{ id: 'e10', timestamp: '2026-03-13T10:40:00Z', phase_id: 'p3', type: 'phase_start', message: '开始分镜脚本 — 预计15个镜头' },
		{ id: 'e11', timestamp: '2026-03-13T10:52:00Z', phase_id: 'p3', type: 'asset_created', message: '镜头表完成：15镜，含景别/运镜/时长标注' },
		{ id: 'e12', timestamp: '2026-03-13T10:58:00Z', phase_id: 'p3', type: 'phase_complete', message: '分镜完成：15镜头，总时长约3分钟' },
		{ id: 'e13', timestamp: '2026-03-13T10:58:00Z', phase_id: 'p4', type: 'phase_start', message: '开始镜头画面生成 — 共15帧关键画面' },
		{ id: 'e14', timestamp: '2026-03-13T11:10:00Z', phase_id: 'p4', type: 'asset_created', message: '镜头1-5画面生成完成（实验室场景）' },
		{ id: 'e15', timestamp: '2026-03-13T11:22:00Z', phase_id: 'p4', type: 'quality_check', message: '镜头7角色面部不一致，触发重新生成', details: 'ARIA-7 眼睛颜色偏差，增加 ref 约束' },
		{ id: 'e16', timestamp: '2026-03-13T11:30:00Z', phase_id: 'p4', type: 'asset_created', message: '镜头6-8完成，镜头9-15生成中...' }
	]
};

export const PPT_WORKFLOW: Workflow = {
	meta: {
		name: 'Q1 业绩汇报 — CEO 演示文稿',
		version: '1.0',
		description: '面向CEO的Q1业绩汇报PPT，12页，聚焦业务影响和ROI',
		estimated_duration: '1-2h',
		output_type: 'PPTX/PDF',
		status: 'completed',
		progress: 100,
		started_at: '2026-03-13T09:00:00Z',
		completed_at: '2026-03-13T10:30:00Z',
		source_skill: 'ppt-generation'
	},
	roles: [
		{ id: 'human', name: '用户', type: 'human', avatar: '🧑', color: '#4488ff', responsibilities: ['提供主题和数据', '审核内容'] },
		{ id: 'claude', name: 'Claude (策略师)', type: 'ai_agent', avatar: '🤖', color: '#ff8844', responsibilities: ['受众分析', '内容策略', '幻灯片设计'] },
		{ id: 'gemini', name: 'Gemini (设计)', type: 'image_gen', avatar: '🎨', color: '#44ff88', responsibilities: ['图表生成', '插图设计'] }
	],
	phases: [
		{ id: 'pp1', name: '需求分析', description: '明确受众、目标、约束', actor: 'claude', status: 'completed', progress: 100, inputs: ['ppt_user_req'], outputs: ['ppt_brief'], quality_gate: '受众明确', on_fail: '重新沟通', started_at: '2026-03-13T09:00:00Z', completed_at: '2026-03-13T09:10:00Z', duration_ms: 600000, order: 1 },
		{ id: 'pp2', name: '受众策略', description: 'CEO受众：简洁、数据驱动、决策导向', actor: 'claude', status: 'completed', progress: 100, inputs: ['ppt_brief'], outputs: ['ppt_persona', 'ppt_strategy'], quality_gate: '策略匹配受众', on_fail: '调整策略', started_at: '2026-03-13T09:10:00Z', completed_at: '2026-03-13T09:20:00Z', duration_ms: 600000, order: 2 },
		{ id: 'pp3', name: '大纲结构', description: 'Story arc: 现状→挑战→方案→成果→展望', actor: 'claude', status: 'completed', progress: 100, inputs: ['ppt_strategy'], outputs: ['ppt_outline'], quality_gate: '每页有明确主题', on_fail: '精简合并', started_at: '2026-03-13T09:20:00Z', completed_at: '2026-03-13T09:35:00Z', duration_ms: 900000, order: 3 },
		{ id: 'pp4', name: '内容填充', description: '文案、数据、案例', actor: 'claude', status: 'completed', progress: 100, inputs: ['ppt_outline'], outputs: ['ppt_content', 'ppt_chart_data', 'ppt_speaker_notes'], quality_gate: '数据准确', on_fail: '核实来源', started_at: '2026-03-13T09:35:00Z', completed_at: '2026-03-13T09:55:00Z', duration_ms: 1200000, order: 4 },
		{ id: 'pp5', name: '视觉设计', description: '模板、图表、插图', actor: 'gemini', status: 'completed', progress: 100, inputs: ['ppt_content', 'ppt_chart_data'], outputs: ['ppt_template', 'ppt_charts', 'ppt_illustrations'], quality_gate: '风格一致', on_fail: '重新设计', started_at: '2026-03-13T09:55:00Z', completed_at: '2026-03-13T10:20:00Z', duration_ms: 1500000, order: 5 },
		{ id: 'pp6', name: '组装导出', description: 'PPTX组装、PDF导出', actor: 'claude', status: 'completed', progress: 100, inputs: ['ppt_template', 'ppt_charts', 'ppt_illustrations', 'ppt_content', 'ppt_speaker_notes'], outputs: ['ppt_final', 'ppt_pdf'], quality_gate: '字体嵌入、文件<50MB', on_fail: '压缩图片', started_at: '2026-03-13T10:20:00Z', completed_at: '2026-03-13T10:30:00Z', duration_ms: 600000, order: 6 }
	],
	assets: [
		{ id: 'ppt_user_req', name: '用户需求', type: 'document', format: 'text', produced_by: 'external', consumed_by: ['pp1'], status: 'ready', phase_group: 'input' },
		{ id: 'ppt_brief', name: '需求简报', type: 'document', format: 'MD', produced_by: 'pp1', consumed_by: ['pp2'], status: 'ready', phase_group: 'pp1' },
		{ id: 'ppt_persona', name: '受众画像', type: 'document', format: 'MD', produced_by: 'pp2', consumed_by: ['pp3'], status: 'ready', phase_group: 'pp2' },
		{ id: 'ppt_strategy', name: '内容策略', type: 'document', format: 'MD', produced_by: 'pp2', consumed_by: ['pp3', 'pp5'], status: 'ready', phase_group: 'pp2' },
		{ id: 'ppt_outline', name: '幻灯片大纲', type: 'document', format: 'MD', produced_by: 'pp3', consumed_by: ['pp4'], status: 'ready', phase_group: 'pp3' },
		{ id: 'ppt_content', name: '页面内容', type: 'document', format: 'MD', produced_by: 'pp4', consumed_by: ['pp5', 'pp6'], status: 'ready', phase_group: 'pp4' },
		{ id: 'ppt_chart_data', name: '图表数据', type: 'data', format: 'JSON', produced_by: 'pp4', consumed_by: ['pp5'], status: 'ready', phase_group: 'pp4' },
		{ id: 'ppt_speaker_notes', name: '演讲备注', type: 'document', format: 'MD', produced_by: 'pp4', consumed_by: ['pp6'], status: 'ready', phase_group: 'pp4' },
		{ id: 'ppt_template', name: '幻灯片模板', type: 'template', format: 'PPTX', produced_by: 'pp5', consumed_by: ['pp6'], status: 'ready', phase_group: 'pp5' },
		{ id: 'ppt_charts', name: '图表', type: 'image', format: 'SVG/PNG', produced_by: 'pp5', consumed_by: ['pp6'], status: 'ready', phase_group: 'pp5' },
		{ id: 'ppt_illustrations', name: '插图', type: 'image', format: 'PNG', produced_by: 'pp5', consumed_by: ['pp6'], status: 'ready', phase_group: 'pp5' },
		{ id: 'ppt_final', name: '最终PPTX', type: 'presentation', format: 'PPTX', produced_by: 'pp6', consumed_by: [], status: 'ready', size: '12MB', phase_group: 'pp6' },
		{ id: 'ppt_pdf', name: 'PDF导出', type: 'presentation', format: 'PDF', produced_by: 'pp6', consumed_by: [], status: 'ready', size: '8MB', phase_group: 'pp6' }
	],
	dependencies: [
		{ from: 'ppt_user_req', to: 'ppt_brief', type: 'produces' },
		{ from: 'ppt_brief', to: 'ppt_persona', type: 'produces' },
		{ from: 'ppt_brief', to: 'ppt_strategy', type: 'produces' },
		{ from: 'ppt_strategy', to: 'ppt_outline', type: 'produces' },
		{ from: 'ppt_outline', to: 'ppt_content', type: 'produces' },
		{ from: 'ppt_outline', to: 'ppt_chart_data', type: 'produces' },
		{ from: 'ppt_outline', to: 'ppt_speaker_notes', type: 'produces' },
		{ from: 'ppt_content', to: 'ppt_template', type: 'requires' },
		{ from: 'ppt_chart_data', to: 'ppt_charts', type: 'produces' },
		{ from: 'ppt_strategy', to: 'ppt_illustrations', type: 'references' },
		{ from: 'ppt_template', to: 'ppt_final', type: 'requires' },
		{ from: 'ppt_charts', to: 'ppt_final', type: 'requires' },
		{ from: 'ppt_illustrations', to: 'ppt_final', type: 'requires' },
		{ from: 'ppt_content', to: 'ppt_final', type: 'requires' },
		{ from: 'ppt_speaker_notes', to: 'ppt_final', type: 'requires' },
		{ from: 'ppt_final', to: 'ppt_pdf', type: 'produces' }
	],
	events: [
		{ id: 'pe1', timestamp: '2026-03-13T09:00:00Z', phase_id: 'pp1', type: 'phase_start', message: '开始需求分析' },
		{ id: 'pe2', timestamp: '2026-03-13T09:10:00Z', phase_id: 'pp1', type: 'phase_complete', message: '需求分析完成：CEO受众、Q1业绩、12页' },
		{ id: 'pe3', timestamp: '2026-03-13T09:20:00Z', phase_id: 'pp2', type: 'phase_complete', message: '受众策略：Executive Summary风格，max 3 bullets/页' },
		{ id: 'pe4', timestamp: '2026-03-13T09:35:00Z', phase_id: 'pp3', type: 'phase_complete', message: '大纲完成：12页 Story Arc (现状→挑战→方案→成果→展望)' },
		{ id: 'pe5', timestamp: '2026-03-13T09:55:00Z', phase_id: 'pp4', type: 'phase_complete', message: '内容填充完成，含6张数据图表' },
		{ id: 'pe6', timestamp: '2026-03-13T10:20:00Z', phase_id: 'pp5', type: 'phase_complete', message: '视觉设计完成：企业蓝主题，6张图表+3张插图' },
		{ id: 'pe7', timestamp: '2026-03-13T10:30:00Z', phase_id: 'pp6', type: 'phase_complete', message: '导出完成：PPTX(12MB) + PDF(8MB)' }
	]
};

export const XIAOHONGSHU_WORKFLOW: Workflow = {
	meta: {
		name: '春日穿搭分享 — 小红书爆款图文',
		version: '1.0',
		description: '打造春季穿搭种草笔记，封面+9图+文案，目标10w+曝光',
		estimated_duration: '30min-1h',
		output_type: '图文笔记',
		status: 'in_progress',
		progress: 65,
		started_at: '2026-03-13T14:00:00Z',
		source_skill: 'xiaohongshu-post'
	},
	roles: [
		{ id: 'human', name: '博主', type: 'human', avatar: '👩', color: '#ff69b4', responsibilities: ['选题方向', '审核内容', '最终发布'], current_action: '等待图片生成完成' },
		{ id: 'claude', name: 'Claude (文案策划)', type: 'ai_agent', avatar: '🤖', color: '#ff8844', responsibilities: ['选题分析', '文案撰写', 'SEO优化', '标签策略'], current_action: '优化正文关键词密度' },
		{ id: 'gemini', name: 'Gemini (视觉设计)', type: 'image_gen', avatar: '🎨', color: '#44ff88', responsibilities: ['封面设计', '配图生成', '滤镜调色'], current_action: '生成第5张穿搭配图' }
	],
	phases: [
		{ id: 'xhs1', name: '选题分析', description: '竞品分析、热词挖掘、选题定位', actor: 'claude', status: 'completed', progress: 100, inputs: ['xhs_user_req'], outputs: ['xhs_topic_brief', 'xhs_competitor_analysis'], quality_gate: '选题有热度且有差异化', on_fail: '换选题角度', started_at: '2026-03-13T14:00:00Z', completed_at: '2026-03-13T14:08:00Z', duration_ms: 480000, order: 1 },
		{ id: 'xhs2', name: '文案撰写', description: '标题、正文、标签、话题', actor: 'claude', status: 'completed', progress: 100, inputs: ['xhs_topic_brief', 'xhs_competitor_analysis'], outputs: ['xhs_draft_copy', 'xhs_final_copy', 'xhs_hashtags'], quality_gate: '文案自然不硬广、关键词密度合理', on_fail: '调整文案风格', started_at: '2026-03-13T14:08:00Z', completed_at: '2026-03-13T14:20:00Z', duration_ms: 720000, order: 2 },
		{ id: 'xhs3', name: '图片生成', description: '封面图+配图，统一滤镜调色', actor: 'gemini', status: 'in_progress', progress: 70, inputs: ['xhs_final_copy', 'xhs_topic_brief'], outputs: ['xhs_cover_image', 'xhs_content_img_1', 'xhs_content_img_2', 'xhs_content_img_3'], quality_gate: '风格统一、封面吸睛', on_fail: '调整prompt重新生成', started_at: '2026-03-13T14:20:00Z', duration_ms: 0, order: 3 },
		{ id: 'xhs4', name: '排版设计', description: '图文排版、加字幕贴纸', actor: 'gemini', status: 'pending', progress: 0, inputs: ['xhs_cover_image', 'xhs_content_img_1', 'xhs_content_img_2', 'xhs_content_img_3', 'xhs_final_copy'], outputs: ['xhs_layout'], quality_gate: '排版清晰易读', on_fail: '简化排版', order: 4 },
		{ id: 'xhs5', name: '发布优化', description: 'SEO标签、发布时间、互动话术', actor: 'claude', status: 'pending', progress: 0, inputs: ['xhs_layout', 'xhs_final_copy', 'xhs_hashtags'], outputs: ['xhs_final_post'], quality_gate: '标签≤15个、标题≤20字', on_fail: '精简标签', order: 5 }
	],
	assets: [
		{ id: 'xhs_user_req', name: '博主需求', type: 'document', format: 'text', produced_by: 'external', consumed_by: ['xhs1'], status: 'ready', phase_group: 'input' },
		{ id: 'xhs_topic_brief', name: '选题简报', type: 'document', format: 'MD', produced_by: 'xhs1', consumed_by: ['xhs2', 'xhs3'], status: 'ready', phase_group: 'xhs1' },
		{ id: 'xhs_competitor_analysis', name: '竞品分析', type: 'document', format: 'MD', produced_by: 'xhs1', consumed_by: ['xhs2'], status: 'ready', phase_group: 'xhs1' },
		{ id: 'xhs_draft_copy', name: '文案初稿', type: 'document', format: 'MD', produced_by: 'xhs2', consumed_by: [], status: 'ready', phase_group: 'xhs2' },
		{ id: 'xhs_final_copy', name: '定稿文案', type: 'document', format: 'MD', produced_by: 'xhs2', consumed_by: ['xhs3', 'xhs4', 'xhs5'], status: 'ready', phase_group: 'xhs2' },
		{ id: 'xhs_hashtags', name: '标签集合', type: 'data', format: 'JSON', produced_by: 'xhs2', consumed_by: ['xhs5'], status: 'ready', phase_group: 'xhs2' },
		{ id: 'xhs_cover_image', name: '封面图', type: 'image', format: 'PNG', produced_by: 'xhs3', consumed_by: ['xhs4'], status: 'generating', phase_group: 'xhs3' },
		{ id: 'xhs_content_img_1', name: '配图1-全身穿搭', type: 'image', format: 'PNG', produced_by: 'xhs3', consumed_by: ['xhs4'], status: 'generating', phase_group: 'xhs3' },
		{ id: 'xhs_content_img_2', name: '配图2-细节特写', type: 'image', format: 'PNG', produced_by: 'xhs3', consumed_by: ['xhs4'], status: 'generating', phase_group: 'xhs3' },
		{ id: 'xhs_content_img_3', name: '配图3-搭配对比', type: 'image', format: 'PNG', produced_by: 'xhs3', consumed_by: ['xhs4'], status: 'pending', phase_group: 'xhs3' },
		{ id: 'xhs_layout', name: '排版成品', type: 'image', format: 'PNG', produced_by: 'xhs4', consumed_by: ['xhs5'], status: 'pending', phase_group: 'xhs4' },
		{ id: 'xhs_final_post', name: '最终笔记', type: 'document', format: 'MD+IMG', produced_by: 'xhs5', consumed_by: [], status: 'pending', phase_group: 'xhs5' }
	],
	dependencies: [
		{ from: 'xhs_user_req', to: 'xhs_topic_brief', type: 'produces' },
		{ from: 'xhs_user_req', to: 'xhs_competitor_analysis', type: 'produces' },
		{ from: 'xhs_topic_brief', to: 'xhs_draft_copy', type: 'produces' },
		{ from: 'xhs_competitor_analysis', to: 'xhs_draft_copy', type: 'references' },
		{ from: 'xhs_draft_copy', to: 'xhs_final_copy', type: 'produces' },
		{ from: 'xhs_draft_copy', to: 'xhs_hashtags', type: 'produces' },
		{ from: 'xhs_final_copy', to: 'xhs_cover_image', type: 'requires' },
		{ from: 'xhs_topic_brief', to: 'xhs_content_img_1', type: 'references' },
		{ from: 'xhs_final_copy', to: 'xhs_content_img_2', type: 'requires' },
		{ from: 'xhs_final_copy', to: 'xhs_content_img_3', type: 'requires' },
		{ from: 'xhs_cover_image', to: 'xhs_layout', type: 'requires' },
		{ from: 'xhs_content_img_1', to: 'xhs_layout', type: 'requires' },
		{ from: 'xhs_content_img_2', to: 'xhs_layout', type: 'requires' },
		{ from: 'xhs_content_img_3', to: 'xhs_layout', type: 'requires' },
		{ from: 'xhs_final_copy', to: 'xhs_layout', type: 'requires' },
		{ from: 'xhs_layout', to: 'xhs_final_post', type: 'requires' },
		{ from: 'xhs_hashtags', to: 'xhs_final_post', type: 'requires' }
	],
	events: [
		{ id: 'xe1', timestamp: '2026-03-13T14:00:00Z', phase_id: 'xhs1', type: 'phase_start', message: '开始选题分析' },
		{ id: 'xe2', timestamp: '2026-03-13T14:03:00Z', phase_id: 'xhs1', type: 'asset_created', message: '竞品分析完成：Top10同类笔记数据' },
		{ id: 'xe3', timestamp: '2026-03-13T14:08:00Z', phase_id: 'xhs1', type: 'phase_complete', message: '选题确定：春日法式穿搭，差异化角度=通勤场景' },
		{ id: 'xe4', timestamp: '2026-03-13T14:08:00Z', phase_id: 'xhs2', type: 'phase_start', message: '开始文案撰写' },
		{ id: 'xe5', timestamp: '2026-03-13T14:12:00Z', phase_id: 'xhs2', type: 'quality_check', message: '初稿审核：关键词密度OK，语气需更口语化' },
		{ id: 'xe6', timestamp: '2026-03-13T14:20:00Z', phase_id: 'xhs2', type: 'phase_complete', message: '文案定稿：标题"这套法式通勤穿搭也太绝了吧！"' },
		{ id: 'xe7', timestamp: '2026-03-13T14:20:00Z', phase_id: 'xhs3', type: 'phase_start', message: '开始图片生成' },
		{ id: 'xe8', timestamp: '2026-03-13T14:25:00Z', phase_id: 'xhs3', type: 'asset_created', message: '封面图生成完成' },
		{ id: 'xe9', timestamp: '2026-03-13T14:28:00Z', phase_id: 'xhs3', type: 'asset_created', message: '配图1-全身穿搭照生成完成' },
		{ id: 'xe10', timestamp: '2026-03-13T14:31:00Z', phase_id: 'xhs3', type: 'asset_created', message: '配图2-细节特写生成中...' }
	]
};

export const REFACTOR_WORKFLOW: Workflow = {
	meta: {
		name: 'Legacy API 重构 — REST→GraphQL 迁移',
		version: '1.0',
		description: '将老旧 REST API 迁移到 GraphQL，包含 Schema 设计、Resolver 实现、测试和文档',
		estimated_duration: '4-8h',
		output_type: '代码 + 文档',
		status: 'in_progress',
		progress: 40,
		started_at: '2026-03-13T09:00:00Z',
		source_skill: 'code-refactor'
	},
	roles: [
		{ id: 'human', name: '技术负责人', type: 'human', avatar: '👨‍💻', color: '#4488ff', responsibilities: ['架构决策', '代码审查', '最终合并'], current_action: '审查 Schema 设计' },
		{ id: 'claude', name: 'Claude (架构师/开发)', type: 'ai_agent', avatar: '🤖', color: '#ff8844', responsibilities: ['代码审计', 'Schema 设计', 'Resolver 编写', '测试', '文档'], current_action: '实现 UserResolver 中' },
		{ id: 'reviewer', name: '代码审查员', type: 'human', avatar: '🔍', color: '#aa66ff', responsibilities: ['代码规范审查', '安全审查', '性能评估'], current_action: '等待 Resolver 完成后审查' }
	],
	phases: [
		{ id: 'rf1', name: '代码审计', description: '分析现有 REST API 端点、数据模型、调用关系', actor: 'claude', status: 'completed', progress: 100, inputs: ['rf_codebase'], outputs: ['rf_audit_report', 'rf_dep_graph'], quality_gate: '覆盖所有端点', on_fail: '补充遗漏端点', started_at: '2026-03-13T09:00:00Z', completed_at: '2026-03-13T09:45:00Z', duration_ms: 2700000, order: 1 },
		{ id: 'rf2', name: 'Schema 设计', description: 'GraphQL Schema、Type 定义、Query/Mutation', actor: 'claude', status: 'completed', progress: 100, inputs: ['rf_audit_report', 'rf_dep_graph'], outputs: ['rf_schema', 'rf_types'], quality_gate: 'Schema 覆盖所有原有功能', on_fail: '补充缺失 Type', started_at: '2026-03-13T09:45:00Z', completed_at: '2026-03-13T10:30:00Z', duration_ms: 2700000, order: 2 },
		{ id: 'rf3', name: 'Resolver 实现', description: '编写 Query/Mutation Resolver，对接数据层', actor: 'claude', status: 'in_progress', progress: 45, inputs: ['rf_schema', 'rf_types', 'rf_codebase'], outputs: ['rf_resolvers_user', 'rf_resolvers_product', 'rf_resolvers_order'], quality_gate: '所有 Resolver 通过单元测试', on_fail: '修复失败测试', started_at: '2026-03-13T10:30:00Z', duration_ms: 0, order: 3 },
		{ id: 'rf4', name: '测试覆盖', description: '单元测试 + 集成测试 + E2E 回归', actor: 'claude', status: 'pending', progress: 0, inputs: ['rf_resolvers_user', 'rf_resolvers_product', 'rf_resolvers_order', 'rf_schema'], outputs: ['rf_test_suite'], quality_gate: '覆盖率≥90%', on_fail: '补充测试用例', order: 4 },
		{ id: 'rf5', name: '迁移脚本', description: '数据库迁移、API 路由切换、回滚方案', actor: 'claude', status: 'pending', progress: 0, inputs: ['rf_test_suite', 'rf_resolvers_user', 'rf_resolvers_product', 'rf_resolvers_order'], outputs: ['rf_migration_script', 'rf_rollback_plan'], quality_gate: '迁移可回滚', on_fail: '增加回滚检查点', order: 5 },
		{ id: 'rf6', name: '文档更新', description: 'API 文档、Changelog、迁移指南', actor: 'claude', status: 'pending', progress: 0, inputs: ['rf_schema', 'rf_migration_script', 'rf_rollback_plan'], outputs: ['rf_api_docs', 'rf_changelog'], quality_gate: '文档完整', on_fail: '补充示例', order: 6 }
	],
	assets: [
		{ id: 'rf_codebase', name: '现有代码库', type: 'code', format: 'TypeScript', produced_by: 'external', consumed_by: ['rf1', 'rf3'], status: 'ready', phase_group: 'input' },
		{ id: 'rf_audit_report', name: '审计报告', type: 'document', format: 'MD', produced_by: 'rf1', consumed_by: ['rf2'], status: 'ready', phase_group: 'rf1' },
		{ id: 'rf_dep_graph', name: '依赖关系图', type: 'document', format: 'SVG', produced_by: 'rf1', consumed_by: ['rf2'], status: 'ready', phase_group: 'rf1' },
		{ id: 'rf_schema', name: 'GraphQL Schema', type: 'code', format: 'GraphQL', produced_by: 'rf2', consumed_by: ['rf3', 'rf4', 'rf6'], status: 'ready', phase_group: 'rf2' },
		{ id: 'rf_types', name: 'Type 定义', type: 'code', format: 'TypeScript', produced_by: 'rf2', consumed_by: ['rf3'], status: 'ready', phase_group: 'rf2' },
		{ id: 'rf_resolvers_user', name: 'UserResolver', type: 'code', format: 'TypeScript', produced_by: 'rf3', consumed_by: ['rf4', 'rf5'], status: 'generating', phase_group: 'rf3' },
		{ id: 'rf_resolvers_product', name: 'ProductResolver', type: 'code', format: 'TypeScript', produced_by: 'rf3', consumed_by: ['rf4', 'rf5'], status: 'pending', phase_group: 'rf3' },
		{ id: 'rf_resolvers_order', name: 'OrderResolver', type: 'code', format: 'TypeScript', produced_by: 'rf3', consumed_by: ['rf4', 'rf5'], status: 'pending', phase_group: 'rf3' },
		{ id: 'rf_test_suite', name: '测试套件', type: 'code', format: 'TypeScript', produced_by: 'rf4', consumed_by: ['rf5'], status: 'pending', phase_group: 'rf4' },
		{ id: 'rf_migration_script', name: '迁移脚本', type: 'code', format: 'TypeScript', produced_by: 'rf5', consumed_by: ['rf6'], status: 'pending', phase_group: 'rf5' },
		{ id: 'rf_rollback_plan', name: '回滚方案', type: 'document', format: 'MD', produced_by: 'rf5', consumed_by: ['rf6'], status: 'pending', phase_group: 'rf5' },
		{ id: 'rf_api_docs', name: 'API 文档', type: 'document', format: 'MD', produced_by: 'rf6', consumed_by: [], status: 'pending', phase_group: 'rf6' },
		{ id: 'rf_changelog', name: 'Changelog', type: 'document', format: 'MD', produced_by: 'rf6', consumed_by: [], status: 'pending', phase_group: 'rf6' }
	],
	dependencies: [
		{ from: 'rf_codebase', to: 'rf_audit_report', type: 'produces' },
		{ from: 'rf_codebase', to: 'rf_dep_graph', type: 'produces' },
		{ from: 'rf_audit_report', to: 'rf_schema', type: 'produces' },
		{ from: 'rf_dep_graph', to: 'rf_schema', type: 'references' },
		{ from: 'rf_schema', to: 'rf_types', type: 'produces' },
		{ from: 'rf_schema', to: 'rf_resolvers_user', type: 'requires' },
		{ from: 'rf_types', to: 'rf_resolvers_user', type: 'requires' },
		{ from: 'rf_schema', to: 'rf_resolvers_product', type: 'requires' },
		{ from: 'rf_schema', to: 'rf_resolvers_order', type: 'requires' },
		{ from: 'rf_codebase', to: 'rf_resolvers_user', type: 'references' },
		{ from: 'rf_resolvers_user', to: 'rf_test_suite', type: 'requires' },
		{ from: 'rf_resolvers_product', to: 'rf_test_suite', type: 'requires' },
		{ from: 'rf_resolvers_order', to: 'rf_test_suite', type: 'requires' },
		{ from: 'rf_test_suite', to: 'rf_migration_script', type: 'requires' },
		{ from: 'rf_test_suite', to: 'rf_rollback_plan', type: 'produces' },
		{ from: 'rf_schema', to: 'rf_api_docs', type: 'requires' },
		{ from: 'rf_migration_script', to: 'rf_api_docs', type: 'references' },
		{ from: 'rf_migration_script', to: 'rf_changelog', type: 'produces' }
	],
	events: [
		{ id: 're1', timestamp: '2026-03-13T09:00:00Z', phase_id: 'rf1', type: 'phase_start', message: '开始代码审计' },
		{ id: 're2', timestamp: '2026-03-13T09:15:00Z', phase_id: 'rf1', type: 'asset_created', message: '发现 47 个 REST 端点，12 个数据模型' },
		{ id: 're3', timestamp: '2026-03-13T09:30:00Z', phase_id: 'rf1', type: 'quality_check', message: '审计覆盖率检查：100% 端点已记录' },
		{ id: 're4', timestamp: '2026-03-13T09:45:00Z', phase_id: 'rf1', type: 'phase_complete', message: '审计完成：47端点、12模型、23个跨模型依赖' },
		{ id: 're5', timestamp: '2026-03-13T09:45:00Z', phase_id: 'rf2', type: 'phase_start', message: '开始 GraphQL Schema 设计' },
		{ id: 're6', timestamp: '2026-03-13T10:00:00Z', phase_id: 'rf2', type: 'asset_created', message: 'Schema v1 完成：12 Type、8 Query、15 Mutation' },
		{ id: 're7', timestamp: '2026-03-13T10:15:00Z', phase_id: 'rf2', type: 'quality_check', message: 'Schema Review：增加分页和筛选参数' },
		{ id: 're8', timestamp: '2026-03-13T10:30:00Z', phase_id: 'rf2', type: 'phase_complete', message: 'Schema 定稿：含 Connection 分页、Filter Input' },
		{ id: 're9', timestamp: '2026-03-13T10:30:00Z', phase_id: 'rf3', type: 'phase_start', message: '开始 Resolver 实现' },
		{ id: 're10', timestamp: '2026-03-13T10:50:00Z', phase_id: 'rf3', type: 'asset_created', message: 'UserResolver: Query 部分完成 (getUser, listUsers, searchUsers)' },
		{ id: 're11', timestamp: '2026-03-13T11:10:00Z', phase_id: 'rf3', type: 'quality_check', message: 'UserResolver Mutation 进行中：createUser, updateUser 已完成' }
	]
};

export const DEMO_WORKFLOWS: Record<string, Workflow> = {
	comic: MOTION_COMIC_WORKFLOW,
	ppt: PPT_WORKFLOW,
	xiaohongshu: XIAOHONGSHU_WORKFLOW,
	refactor: REFACTOR_WORKFLOW
};
