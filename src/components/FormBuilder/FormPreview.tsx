import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Heart, Plus, Star, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerInput } from "@/components/ui/date-pick-input";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TimePickerInput } from "@/components/ui/time-pick-input";
import { cn } from "@/lib/utils";
import type { FormField, FormSection } from "@/types";

interface FormPreviewProps {
	sections: FormSection[];
	activeSectionId: string | null;
	onSectionSelect: (id: string | null) => void;
	onAddSection: () => void;
	onAddField: (sectionId: string) => void;
	onUpdateField: (
		sectionId: string,
		fieldId: string,
		updates: Partial<FormField>,
	) => void;
	onRemoveField: (sectionId: string, fieldId: string) => void;
	onReorderSections: (sections: FormSection[]) => void;
	onMoveField: (
		sourceSectionId: string,
		targetSectionId: string,
		fieldId: string,
		index?: number,
	) => void;
	onReorderFields: (sectionId: string, fields: FormField[]) => void;
}

interface SortableSectionProps {
	section: FormSection;
	activeSectionId: string | null;
	onSectionSelect: (id: string | null) => void;
	onAddField: (sectionId: string) => void;
	renderFieldControls: (sectionId: string, field: FormField) => React.ReactNode;
}

const SortableSection: React.FC<SortableSectionProps> = ({
	section,
	activeSectionId,
	onSectionSelect,
	onAddField,
	renderFieldControls,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: section.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<motion.div
			ref={setNodeRef}
			style={style}
			layoutId={section.id}
			onClick={() => onSectionSelect(section.id)}
			className={cn(
				"relative group rounded-xl border-2 transition-all duration-200 p-6 bg-white shadow-sm",
				activeSectionId === section.id
					? "border-primary ring-4 ring-primary/10"
					: "border-slate-200 hover:border-slate-300",
				isDragging && "opacity-50 z-50",
			)}
		>
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div
						{...attributes}
						{...listeners}
						className="p-2 bg-slate-100 rounded-lg text-slate-400 cursor-grab active:cursor-grabbing hover:bg-slate-200 transition-colors"
					>
						<GripVertical size={20} />
					</div>
					<input
						type="text"
						defaultValue={section.title}
						className="text-xl font-semibold text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300"
						placeholder="Section Title"
					/>
				</div>
				<div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
					ID: {section.id}
				</div>
			</div>

			<SortableContext
				items={section.fields.map((f) => f.id)}
				strategy={verticalListSortingStrategy}
			>
				<div className="space-y-4">
					{section.fields.map((field) => (
						<SortableField
							key={field.id}
							field={field}
							sectionId={section.id}
							renderFieldControls={renderFieldControls}
						/>
					))}
				</div>
			</SortableContext>

			<button
				onClick={(e) => {
					e.stopPropagation();
					onAddField(section.id);
				}}
				className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-primary hover:text-primary hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-medium mt-4"
			>
				<Plus size={18} />
				Add Field
			</button>
		</motion.div>
	);
};

interface SortableFieldProps {
	field: FormField;
	sectionId: string;
	renderFieldControls: (sectionId: string, field: FormField) => React.ReactNode;
}

const SortableField: React.FC<SortableFieldProps> = ({
	field,
	sectionId,
	renderFieldControls,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: field.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"p-4 rounded-lg bg-slate-50 border border-slate-200 group/field hover:border-slate-300 transition-colors",
				isDragging && "opacity-50 z-50 shadow-lg",
			)}
			onClick={(e) => e.stopPropagation()}
		>
			<div className="flex items-start gap-3">
				<div
					{...attributes}
					{...listeners}
					className="p-1.5 bg-slate-200 rounded text-slate-400 cursor-grab active:cursor-grabbing hover:bg-slate-300 transition-colors mt-1 shrink-0"
				>
					<GripVertical size={16} />
				</div>
				<div className="flex-1">{renderFieldControls(sectionId, field)}</div>
			</div>
		</div>
	);
};

export const FormPreview: React.FC<FormPreviewProps> = ({
	sections,
	activeSectionId,
	onSectionSelect,
	onAddSection,
	onAddField,
	onUpdateField,
	onRemoveField,
	onReorderSections,
	onMoveField,
	onReorderFields,
}) => {
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [activeType, setActiveType] = useState<"section" | "field" | null>(
		null,
	);

	const activeSectionData = sections.find((section) => section.id === activeId);
	const activeFieldData = sections
		.flatMap((section) =>
			section.fields.map((field) => ({
				field,
				sectionId: section.id,
			})),
		)
		.find(({ field }) => field.id === activeId);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		setActiveId(active.id);

		const isSection = sections.some((section) => section.id === active.id);
		setActiveType(isSection ? "section" : "field");
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id.toString();
		const overId = over.id.toString();

		const activeSection = sections.find(
			(section) =>
				section.id === activeId ||
				section.fields.some((field) => field.id === activeId),
		);

		const overSection = sections.find(
			(section) =>
				section.id === overId ||
				section.fields.some((field) => field.id === overId),
		);

		if (!activeSection || !overSection) return;

		if (
			activeSection.id !== overSection.id &&
			sections.some((s) => s.fields.some((f) => f.id === activeId))
		) {
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);
		setActiveType(null);

		if (!over) return;

		const activeId = active.id.toString();
		const overId = over.id.toString();

		if (activeId !== overId && sections.some((s) => s.id === activeId)) {
			const oldIndex = sections.findIndex((section) => section.id === activeId);
			const newIndex = sections.findIndex((section) => section.id === overId);

			if (oldIndex !== -1 && newIndex !== -1) {
				const newSections = arrayMove(sections, oldIndex, newIndex);
				onReorderSections(newSections);
			}
			return;
		}

		const sectionContainingActive = sections.find((section) =>
			section.fields.some((field) => field.id === activeId),
		);

		const sectionContainingOver = sections.find((section) =>
			section.fields.some((field) => field.id === overId),
		);

		if (sectionContainingActive && sectionContainingOver) {
			if (sectionContainingActive.id === sectionContainingOver.id) {
				const oldIndex = sectionContainingActive.fields.findIndex(
					(field) => field.id === activeId,
				);
				const newIndex = sectionContainingOver.fields.findIndex(
					(field) => field.id === overId,
				);

				if (oldIndex !== -1 && newIndex !== -1) {
					const newFields = arrayMove(
						sectionContainingActive.fields,
						oldIndex,
						newIndex,
					);
					onReorderFields(sectionContainingActive.id, newFields);
				}
			} else {
				onMoveField(
					sectionContainingActive.id,
					sectionContainingOver.id,
					activeId,
				);
			}
		}
	};

	const renderFieldControls = (sectionId: string, field: FormField) => {
		const isOptionBased =
			field.type === "select" ||
			field.type === "radio" ||
			field.type === "checkbox";
		return (
			<div className="space-y-3">
				<div className="flex gap-3 flex-wrap">
					<Input
						value={field.label}
						onChange={(e) =>
							onUpdateField(sectionId, field.id, { label: e.target.value })
						}
						className="flex-1 min-w-48"
						placeholder="Question text"
					/>

					<Select
						value={field.type}
						onValueChange={(value) =>
							onUpdateField(sectionId, field.id, {
								type: value as any,
								ratingScale: value === "rating" ? 5 : field.ratingScale,
							})
						}
					>
						<SelectTrigger className="w-32">
							<SelectValue placeholder="Tipo" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="text">Short text</SelectItem>
							<SelectItem value="long_text">Long text</SelectItem>
							<SelectItem value="select">Dropdown</SelectItem>
							<SelectItem value="radio">Single choice</SelectItem>
							<SelectItem value="checkbox">Multiple choice</SelectItem>
							<SelectItem value="rating">Rating</SelectItem>
							<SelectItem value="date">Date</SelectItem>
							<SelectItem value="time">Time</SelectItem>
						</SelectContent>
					</Select>

					<label className="flex items-center gap-2 text-sm text-slate-600">
						<Checkbox
							checked={!!field.required}
							onCheckedChange={(checked) =>
								onUpdateField(sectionId, field.id, {
									required: checked === true,
								})
							}
						/>
						Required
					</label>

					<button
						onClick={() => onRemoveField(sectionId, field.id)}
						className="text-slate-400 hover:text-red-500 transition-colors"
						title="Remove field"
						type="button"
					>
						<Trash2 size={16} />
					</button>
				</div>

				{field.type === "long_text" && (
					<Textarea
						disabled
						placeholder="Long answer..."
						className="min-h-[90px]"
					/>
				)}

				{field.type === "text" && (
					<Input disabled placeholder="Short answer..." />
				)}
				{field.type === "date" && (
					<DatePickerInput disabled label="Date" placeholder="Pick a date" />
				)}
				{field.type === "time" && <TimePickerInput disabled label="Time" />}

				{field.type === "rating" && (
					<div className="space-y-3">
						<div className="flex gap-2 flex-wrap">
							<Select
								value={String(field.ratingScale ?? 5)}
								onValueChange={(val) =>
									onUpdateField(sectionId, field.id, {
										ratingScale: Number(val),
									})
								}
							>
								<SelectTrigger className="w-[110px]">
									<SelectValue placeholder="Scale" />
								</SelectTrigger>
								<SelectContent>
									{[4, 5, 6, 7, 8, 9, 10].map((n) => (
										<SelectItem key={n} value={String(n)}>
											{n} points
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={field.ratingIcon ?? "radio"}
								onValueChange={(val) =>
									onUpdateField(sectionId, field.id, { ratingIcon: val as any })
								}
							>
								<SelectTrigger className="w-[150px]">
									<SelectValue placeholder="Icon" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="radio">Circle</SelectItem>
									<SelectItem value="star">Star</SelectItem>
									<SelectItem value="heart">Heart</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<RadioGroup
							value={String(Math.ceil((field.ratingScale ?? 5) / 2))}
							className="flex items-center justify-evenly gap-2 text-slate-600"
						>
							{Array.from({ length: field.ratingScale ?? 5 }, (_, i) => {
								const val = String(i + 1);
								const icon = field.ratingIcon ?? "radio";
								const useIcon = icon === "star" || icon === "heart";
								return (
									<div
										key={val}
										className="flex flex-col items-center gap-1 min-w-[40px]"
									>
										<label className="cursor-pointer text-slate-500 hover:text-primary transition-colors flex flex-col items-center mt-1.5">
											<RadioGroupItem
												value={val}
												id={`rating-preview-${field.id}-${val}`}
												className={cn(
													"data-[state=checked]:border-primary size-5",
													useIcon && "sr-only hidden",
												)}
											/>

											{icon === "heart" && <Heart size={20} />}
											{icon === "star" && <Star size={20} />}
											<span className="text-[0.625rem] mt-1 text-slate-500">
												{val}
											</span>
										</label>
									</div>
								);
							})}
						</RadioGroup>
					</div>
				)}

				{isOptionBased && (
					<div className="space-y-2">
						{(field.options ?? []).map((opt, idx) => (
							<div key={opt + idx} className="flex items-center gap-2">
								<Input
									value={opt}
									onChange={(e) => {
										const newOpts = [...(field.options ?? [])];
										newOpts[idx] = e.target.value;
										onUpdateField(sectionId, field.id, { options: newOpts });
									}}
									className="flex-1"
								/>
								<button
									type="button"
									onClick={() => {
										const newOpts = (field.options ?? []).filter(
											(_, i) => i !== idx,
										);
										onUpdateField(sectionId, field.id, { options: newOpts });
									}}
									className="text-slate-400 hover:text-red-500 transition-colors"
									title="Remove option"
								>
									<Trash2 size={14} />
								</button>
							</div>
						))}

						<button
							type="button"
							onClick={() => {
								const count = (field.options?.length ?? 0) + 1;
								const newOpts = [...(field.options ?? []), `Option ${count}`];
								onUpdateField(sectionId, field.id, { options: newOpts });
							}}
							className="text-xs text-primary hover:text-indigo-700 font-medium"
						>
							+ Add option
						</button>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="flex-1 bg-slate-50 h-full overflow-y-auto p-8 font-sans">
			<div className="max-w-3xl mx-auto space-y-8">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-slate-900 tracking-tight">
						Form Preview
					</h1>
					<p className="text-slate-500 mt-2">
						Build your form structure here. Configure logic in the sidebar.
					</p>
				</div>

				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={sections.map((s) => s.id)}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-8">
							{sections.map((section) => (
								<SortableSection
									key={section.id}
									section={section}
									activeSectionId={activeSectionId}
									onSectionSelect={onSectionSelect}
									onAddField={onAddField}
									renderFieldControls={renderFieldControls}
								/>
							))}
						</div>
					</SortableContext>

					<DragOverlay dropAnimation={null}>
						{activeType === "section" && activeSectionData ? (
							<div
								className="w-full max-w-3xl rounded-xl border-2 border-primary bg-white p-6 shadow-2xl opacity-95 scale-[1.01]"
								style={{ width: "min(100%, 780px)" }}
							>
								<div className="flex items-center gap-3 mb-4">
									<div className="p-2 bg-slate-100 rounded-lg text-slate-400">
										<GripVertical size={20} />
									</div>
									<div className="text-xl font-semibold text-slate-900 truncate">
										{activeSectionData.title || "Untitled section"}
									</div>
								</div>
								<div className="space-y-3">
									{activeSectionData.fields.slice(0, 2).map((field) => (
										<div
											key={field.id}
											className="h-14 rounded-lg border border-slate-200 bg-slate-50 flex items-center px-4 text-slate-400"
										>
											<div className="p-1.5 bg-slate-200 rounded text-slate-400 mr-3">
												<GripVertical size={16} />
											</div>
											<div className="flex-1 h-3 rounded bg-slate-200" />
										</div>
									))}
									<div className="h-12 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50" />
								</div>
							</div>
						) : activeType === "field" && activeFieldData ? (
							<div
								className="w-full max-w-3xl p-4 rounded-lg bg-white border-2 border-primary shadow-2xl opacity-95"
								style={{ width: "min(100%, 780px)" }}
							>
								<div className="flex items-start gap-3">
									<div className="p-1.5 bg-slate-200 rounded text-slate-400 mt-1 shrink-0">
										<GripVertical size={16} />
									</div>
									<div className="flex-1 space-y-3">
										<div className="flex gap-3 flex-wrap">
											<div className="flex-1 min-w-48 h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 flex items-center text-slate-700">
												{activeFieldData.field.label || "New Question"}
											</div>
											<div className="w-32 h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 flex items-center capitalize text-slate-500">
												{activeFieldData.field.type.replace("_", " ")}
											</div>
											<div className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 flex items-center gap-2">
												<Checkbox checked={!!activeFieldData.field.required} disabled />
												<span className="text-sm">Required</span>
											</div>
										</div>
										<div className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 flex items-center text-slate-400">
											{activeFieldData.field.type === "long_text"
												? "Long answer..."
												: activeFieldData.field.type === "date"
													? "Pick a date"
													: activeFieldData.field.type === "time"
														? "Select time"
														: "Short answer..."}
										</div>
									</div>
								</div>
							</div>
						) : null}
					</DragOverlay>
				</DndContext>

				<button
					onClick={onAddSection}
					className="w-full py-6 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-primary hover:text-primary hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2"
				>
					<div className="p-3 bg-slate-100 rounded-full group-hover:bg-indigo-100">
						<Plus size={24} />
					</div>
					<span className="font-medium">Add New Section</span>
				</button>
			</div>
		</div>
	);
};
