import { Handle, type NodeProps, Position, useReactFlow } from '@xyflow/react';
import { Plus, Trash2, X } from 'lucide-react';
import { memo, useId } from 'react';
import { cn } from '@/lib/utils';
import type { ConditionRule, FormSection } from '@/types';

interface ConditionNodeData {
  label: string;
  rules: ConditionRule[];
  availableSections: FormSection[];
  onUpdate?: (id: string, data: any) => void;
}

export const ConditionNode = memo(({ id, data, selected }: NodeProps) => {
  const { rules = [], availableSections = [] } = data as unknown as ConditionNodeData;
  const { updateNodeData, deleteElements } = useReactFlow();

  const handleDeleteNode = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const handleAddRule = () => {
    const newRule: ConditionRule = {
      id: `rule_${Date.now()}`,
      fieldId: '',
      operator: 'equals',
      value: '',
    };
    updateNodeData(id, { rules: [...rules, newRule] });
  };

  const handleRemoveRule = (ruleId: string) => {
    updateNodeData(id, { rules: rules.filter((r) => r.id !== ruleId) });
  };

  const handleUpdateRule = (ruleId: string, field: keyof ConditionRule, value: string) => {
    updateNodeData(id, {
      rules: rules.map((r) => (r.id === ruleId ? { ...r, [field]: value } : r)),
    });
  };

  const allFields = availableSections.flatMap((s) =>
    s.fields.map((f) => ({ ...f, sectionTitle: s.title }))
  );

  return (
    <div
      className={cn(
        'bg-white rounded-lg border-2 shadow-lg min-w-[300px] overflow-hidden transition-all group',
        selected ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200',
      )}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-sm whitespace-nowrap">
          Incoming Flow
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 !w-3 !h-3 hover:!bg-orange-500 transition-colors"
      />

      <div className="bg-orange-50 border-b border-orange-100 p-3 flex justify-between items-center">
        <h3 className="font-semibold text-orange-800 text-sm flex items-center gap-2">
          <span className="text-xs bg-orange-200 px-1.5 py-0.5 rounded text-orange-700">IF</span>
          Condition Logic
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteNode();
          }}
          className="p-1 hover:bg-orange-200 rounded text-orange-400 hover:text-orange-700 transition-colors"
          title="Delete Block"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {rules.map((rule, _index) => (
          <div key={rule.id} className="relative bg-slate-50 p-2 rounded border border-slate-200">
            <div className="flex flex-col gap-2">
              <select
                className="text-xs w-full p-1.5 rounded border border-slate-300 bg-white"
                value={rule.fieldId}
                onChange={(e) => handleUpdateRule(rule.id, 'fieldId', e.target.value)}
              >
                <option value="">Select Field...</option>
                {allFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.sectionTitle} - {f.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <select
                  className="text-xs w-1/3 p-1.5 rounded border border-slate-300 bg-white"
                  value={rule.operator}
                  onChange={(e) => handleUpdateRule(rule.id, 'operator', e.target.value as any)}
                >
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not Equals</option>
                  <option value="contains">Contains</option>
                  <option value="greater_than">Greater Than</option>
                  <option value="less_than">Less Than</option>
                  <option value="greater_equal">Greater or Equal</option>
                  <option value="less_equal">Less or Equal</option>
                  <option value="is_empty">Is Empty</option>
                  <option value="is_not_empty">Is Not Empty</option>
                </select>
                <input
                  type="text"
                  className="text-xs w-2/3 p-1.5 rounded border border-slate-300"
                  placeholder="Value..."
                  value={rule.value}
                  onChange={(e) => handleUpdateRule(rule.id, 'value', e.target.value)}
                />
              </div>
            </div>

            {/* Output Handle for this specific rule */}
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center">
              <div className="bg-white text-[10px] font-bold text-slate-400 mr-1 px-1 border border-slate-200 rounded">
                THEN
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={rule.id}
                className="!bg-orange-500 !w-3 !h-3 !relative !transform-none !right-0"
              />
            </div>

            <button
              onClick={() => handleRemoveRule(rule.id)}
              className="absolute -top-2 -left-2 bg-white rounded-full p-0.5 border border-slate-200 text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <button
          onClick={handleAddRule}
          className="w-full py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded border border-orange-200 flex items-center justify-center gap-1 transition-colors"
        >
          <Plus size={12} />
          Add Condition
        </button>
      </div>

      {/* Fallback Handle */}
      <div className="bg-slate-50 p-2 border-t border-slate-100 flex justify-end items-center relative">
        <span className="text-xs text-slate-500 mr-3 font-medium">Else / Default</span>
        <Handle
          type="source"
          position={Position.Right}
          id={useId()}
          className="!bg-slate-400 !w-3 !h-3"
        />
      </div>
    </div>
  );
});
