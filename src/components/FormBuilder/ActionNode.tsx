import type { NodeProps } from "@xyflow/react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Globe, Trash2, Zap } from "lucide-react";
import { memo } from "react";
import { InfoCard, InfoCardContent } from "@/components/ui/info-card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ActionConfig } from "@/types";

interface ActionNodeData {
	label: string;
	actionConfig: ActionConfig;
}

export const ActionNode = memo(({ id, data, selected }: NodeProps) => {
	const { actionConfig } = data as unknown as ActionNodeData;
	const { updateNodeData, deleteElements } = useReactFlow();

	const stopPointerPropagation = (e: React.PointerEvent) => {
		e.stopPropagation();
	};

	const handleDeleteNode = () => {
		deleteElements({ nodes: [{ id }] });
	};

	const handleUpdateConfig = (field: keyof ActionConfig, value: string) => {
		updateNodeData(id, {
			actionConfig: { ...actionConfig, [field]: value },
		});
	};

	const isRedirect = actionConfig?.type === "redirect";

	return (
		<div
			className={cn(
				"bg-white rounded-lg border-2 shadow-lg min-w-[250px] overflow-hidden transition-all",
				selected
					? "border-emerald-500 ring-2 ring-emerald-500/20"
					: "border-slate-200",
			)}
		>
			<Handle
				type="target"
				position={Position.Left}
				className="!bg-slate-400 !w-3 !h-3"
			/>

			<div
				className={cn(
					"border-b p-3 flex justify-between items-center",
					isRedirect
						? "bg-emerald-50 border-emerald-100"
						: "bg-purple-50 border-purple-100",
				)}
			>
				<h3
					className={cn(
						"font-semibold text-sm flex items-center gap-2",
						isRedirect ? "text-emerald-800" : "text-purple-800",
					)}
				>
					{isRedirect ? <Globe size={16} /> : <Zap size={16} />}
					{isRedirect ? "Redirect URL" : "Trigger Action"}
				</h3>
				<div className="flex items-center gap-2">
					<InfoCard>
						<InfoCardContent
							title="How this node works"
							description={
								isRedirect
									? "Sends the user to a destination after this flow finishes. Provide the full URL."
									: "Fires a webhook/custom action. Set the action ID or payload that your backend expects."
							}
						/>
					</InfoCard>
					<Select
						value={actionConfig?.type || "redirect"}
						onValueChange={(value) => handleUpdateConfig("type", value ?? "")}
					>
						<SelectTrigger
							size="sm"
							className="w-28 text-[10px]"
							onPointerDownCapture={stopPointerPropagation}
							onPointerUpCapture={stopPointerPropagation}
						>
							<SelectValue placeholder="Action type" />
						</SelectTrigger>
						<SelectContent align="center">
							<SelectItem value="redirect">Redirect</SelectItem>
							<SelectItem value="webhook">Webhook</SelectItem>
						</SelectContent>
					</Select>
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleDeleteNode();
						}}
						className={cn(
							"p-1 rounded transition-colors",
							isRedirect
								? "hover:bg-emerald-200 text-emerald-400 hover:text-emerald-700"
								: "hover:bg-purple-200 text-purple-400 hover:text-purple-700",
						)}
						title="Delete Block"
					>
						<Trash2 size={14} />
					</button>
				</div>
			</div>

			<div className="p-3 space-y-3">
				{isRedirect ? (
					<div>
						<label className="block text-xs font-medium text-slate-500 mb-1">
							Destination URL
						</label>
						<Input
							type="url"
							className="text-xs w-full"
							placeholder="https://example.com/success"
							value={actionConfig?.url || ""}
							onChange={(e) => handleUpdateConfig("url", e.target.value)}
						/>
					</div>
				) : (
					<div>
						<label className="block text-xs font-medium text-slate-500 mb-1">
							Webhook / Action ID
						</label>
						<Input
							type="text"
							className="text-xs w-full"
							placeholder="user_register_v1"
							value={actionConfig?.message || ""}
							onChange={(e) => handleUpdateConfig("message", e.target.value)}
						/>
					</div>
				)}
			</div>
		</div>
	);
});
