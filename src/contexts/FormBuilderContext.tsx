import {
	applyEdgeChanges,
	applyNodeChanges,
	type Edge,
	type Node,
	type OnEdgesChange,
	type OnNodesChange,
} from "@xyflow/react";
import type React from "react";
import { useEffect } from "react";
import { create } from "zustand";
import type {
	ApiLogicEdgePayload,
	ApiLogicNodePayload,
	ApiSectionPayload,
	FormApiPayload,
	FormField,
	FormSection,
	LogicNodeData,
	LogicNodeType,
} from "@/types";

const STORAGE_KEY = "livePreviewFlow";

const INITIAL_SECTIONS: FormSection[] = [
	{
		id: "sec_1",
		title: "Welcome & Basic Info",
		fields: [
			{ id: "f_1", type: "text", label: "What is your name?", required: true },
			{
				id: "f_2",
				type: "select",
				label: "Select your department",
				options: ["Sales", "Engineering", "Support"],
			},
			{
				id: "f_2b",
				type: "checkbox",
				label: "Interests",
				options: ["UI", "APIs", "Data"],
			},
		],
	},
	{
		id: "sec_2",
		title: "Engineering Details",
		fields: [
			{
				id: "f_3",
				type: "radio",
				label: "Primary Language",
				options: ["TypeScript", "Python", "Rust"],
			},
			{
				id: "f_5",
				type: "rating",
				label: "Code quality self-score",
				ratingScale: 7,
				ratingIcon: "star",
			},
			{ id: "f_7", type: "date", label: "Preferred start date" },
			{ id: "f_8", type: "time", label: "Daily standup time" },
		],
	},
	{
		id: "sec_3",
		title: "Sales Targets",
		fields: [
			{ id: "f_4", type: "text", label: "Monthly Target ($)" },
			{ id: "f_6", type: "long_text", label: "Any notes?" },
		],
	},
];

type FormBuilderState = {
	sections: FormSection[];
	activeSectionId: string | null;
	nodes: Node[];
	edges: Edge[];
	setSections: (sections: FormSection[]) => void;
	setActiveSectionId: (id: string | null) => void;
	setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
	setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
	onNodesChange: OnNodesChange;
	onEdgesChange: OnEdgesChange;
	addSection: () => void;
	addField: (sectionId: string) => void;
	updateField: (
		sectionId: string,
		fieldId: string,
		updates: Partial<FormSection["fields"][number]>,
	) => void;
	removeField: (sectionId: string, fieldId: string) => void;
	reorderSections: (newSections: FormSection[]) => void;
	moveField: (
		sourceSectionId: string,
		targetSectionId: string,
		fieldId: string,
		index?: number,
	) => void;
	reorderFields: (sectionId: string, newFields: FormField[]) => void;
	saveLocal: () => void;
	buildApiPayload: () => FormApiPayload;
	hydrate: () => void;
};

const buildSectionChainEdges = (sections: FormSection[]): Edge[] =>
	sections.slice(0, -1).map((section, index) => ({
		id: `edge_${section.id}_${sections[index + 1].id}`,
		source: section.id,
		target: sections[index + 1].id,
		animated: true,
		style: { stroke: "#94a3b8", strokeWidth: 2 },
		markerEnd: { type: "arrowclosed", color: "#94a3b8" },
	}));

export const useFormBuilder = create<FormBuilderState>((set, get) => ({
	sections: INITIAL_SECTIONS,
	activeSectionId: "sec_1",
	nodes: [],
	edges: [],

	setSections: (sections) => set({ sections }),
	setActiveSectionId: (id) => set({ activeSectionId: id }),
	setNodes: (value) =>
		set((state) => ({
			nodes: typeof value === "function" ? (value as any)(state.nodes) : value,
		})),
	setEdges: (value) =>
		set((state) => ({
			edges: typeof value === "function" ? (value as any)(state.edges) : value,
		})),

	onNodesChange: (changes) =>
		set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
	onEdgesChange: (changes) =>
		set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

	addSection: () => {
		const { sections, edges } = get();
		const newId = `sec_${sections.length + 1}`;
		const updatedSections = [
			...sections,
			{ id: newId, title: "New Section", fields: [] },
		];

		const prevId = sections[sections.length - 1]?.id;
		const maybeEdge =
			prevId && !edges.some((e) => e.source === prevId && e.target === newId)
				? [
						{
							id: `edge_${prevId}_${newId}`,
							source: prevId,
							target: newId,
							animated: true,
							style: { stroke: "#94a3b8", strokeWidth: 2 },
							markerEnd: { type: "arrowclosed", color: "#94a3b8" },
						} as Edge,
					]
				: [];

		set({
			sections: updatedSections,
			activeSectionId: newId,
			edges: [...edges, ...maybeEdge],
		});
	},

	addField: (sectionId) =>
		set((state) => ({
			sections: state.sections.map((sec) =>
				sec.id === sectionId
					? {
							...sec,
							fields: [
								...sec.fields,
								{ id: `f_${Date.now()}`, type: "text", label: "New Question" },
							],
						}
					: sec,
			),
		})),

	updateField: (sectionId, fieldId, updates) =>
		set((state) => ({
			sections: state.sections.map((sec) => {
				if (sec.id !== sectionId) return sec;
				return {
					...sec,
					fields: sec.fields.map((f) =>
						f.id === fieldId
							? {
									...f,
									...updates,
									...(updates.type === "select" ||
									updates.type === "radio" ||
									updates.type === "checkbox"
										? { options: f.options ?? ["Option 1"] }
										: {}),
									...(updates.type === "rating"
										? { ratingScale: updates.ratingScale ?? 5 }
										: {}),
								}
							: f,
					),
				};
			}),
		})),

	removeField: (sectionId, fieldId) =>
		set((state) => ({
			sections: state.sections.map((sec) =>
				sec.id === sectionId
					? { ...sec, fields: sec.fields.filter((f) => f.id !== fieldId) }
					: sec,
			),
		})),

	reorderSections: (newSections) => set({ sections: newSections }),

	moveField: (sourceSectionId, targetSectionId, fieldId, index) =>
		set((state) => {
			const sourceSection = state.sections.find(
				(sec) => sec.id === sourceSectionId,
			);
			if (!sourceSection) return state;

			const fieldToMove = sourceSection.fields.find((f) => f.id === fieldId);
			if (!fieldToMove) return state;

			const withoutField = state.sections.map((sec) =>
				sec.id === sourceSectionId
					? { ...sec, fields: sec.fields.filter((f) => f.id !== fieldId) }
					: sec,
			);

			const updated = withoutField.map((sec) => {
				if (sec.id !== targetSectionId) return sec;
				const targetFields = [...sec.fields];
				const insertIndex = index !== undefined ? index : targetFields.length;
				targetFields.splice(insertIndex, 0, fieldToMove);
				return { ...sec, fields: targetFields };
			});

			return { sections: updated };
		}),

	reorderFields: (sectionId, newFields) =>
		set((state) => ({
			sections: state.sections.map((sec) =>
				sec.id === sectionId ? { ...sec, fields: newFields } : sec,
			),
		})),

	saveLocal: () => {
		if (typeof window === "undefined") return;
		const { sections, nodes, edges } = get();
		try {
			const payload = { sections, nodes, edges };
			localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
		} catch (err) {
			console.warn("Failed to persist builder data", err);
		}
	},

	buildApiPayload: () => {
		const { sections, nodes, edges } = get();

		const safeId = (val: unknown) => (typeof val === "string" ? val : undefined);

		const sectionsPayload: ApiSectionPayload[] = sections.map(
			(section, sectionIndex) => ({
				id: safeId(section.backendId),
				clientId: section.id,
				title: section.title,
				position: sectionIndex,
				fields: section.fields.map((field, fieldIndex) => ({
					id: safeId(field.backendId),
					clientId: field.id,
					type: field.type,
					label: field.label,
					required: !!field.required,
					options: field.options,
					ratingScale: field.ratingScale,
					ratingIcon: field.ratingIcon,
					position: fieldIndex,
				})),
			}),
		);

		const logicNodes: ApiLogicNodePayload[] = nodes.map((node) => {
			const data = (node.data ?? {}) as Partial<
				LogicNodeData & { backendId?: string; sectionBackendId?: string }
			>;

			return {
				id: safeId(data.backendId),
				clientId: node.id,
				type: (data.type as LogicNodeType) ?? "section",
				sectionId: data.sectionBackendId ?? data.sectionId,
				rules: data.rules,
				actionConfig: data.actionConfig,
				position: node.position,
			};
		});

		const logicEdges: ApiLogicEdgePayload[] = edges.map((edge) => ({
			id: safeId((edge.data as { backendId?: string } | undefined)?.backendId),
			clientId: edge.id,
			sourceClientId: edge.source,
			targetClientId: edge.target,
		}));

		return {
			title: "LogicFlow Form",
			startSectionId: sections[0]?.backendId ?? sections[0]?.id ?? null,
			sections: sectionsPayload,
			logic: { nodes: logicNodes, edges: logicEdges },
		};
	},

	hydrate: () => {
		if (typeof window === "undefined") return;
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (!saved) {
				set({ edges: buildSectionChainEdges(INITIAL_SECTIONS) });
				return;
			}
			const parsed = JSON.parse(saved) as {
				sections?: FormSection[];
				nodes?: Node[];
				edges?: Edge[];
			};
			const nextSections = parsed.sections?.length
				? parsed.sections
				: INITIAL_SECTIONS;
			set({
				sections: nextSections,
				activeSectionId: nextSections[0]?.id ?? null,
				nodes: parsed.nodes ?? [],
				edges: parsed.edges ?? buildSectionChainEdges(nextSections),
			});
		} catch (err) {
			console.warn("Failed to load cached builder data", err);
			set({ edges: buildSectionChainEdges(INITIAL_SECTIONS) });
		}
	},
}));

export const FormBuilderProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	useEffect(() => {
		useFormBuilder.getState().hydrate();
	}, []);

	return <>{children}</>;
};
