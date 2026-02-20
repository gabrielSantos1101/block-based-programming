import { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Globe, Zap, Trash2 } from 'lucide-react';
import type { ActionConfig } from '@/types';

interface ActionNodeData {
  label: string;
  actionConfig: ActionConfig;
}

export const ActionNode = memo(({ id, data, selected }: NodeProps) => {
  const { actionConfig } = data as unknown as ActionNodeData;
  const { updateNodeData, deleteElements } = useReactFlow();

  const handleDeleteNode = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const handleUpdateConfig = (field: keyof ActionConfig, value: string) => {
    updateNodeData(id, {
      actionConfig: { ...actionConfig, [field]: value }
    });
  };

  const isRedirect = actionConfig?.type === 'redirect';

  return (
    <div className={`
      bg-white rounded-lg border-2 shadow-lg min-w-[250px] overflow-hidden transition-all
      ${selected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'}
    `}>
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-3 !h-3" />
      
      <div className={`
        border-b p-3 flex justify-between items-center
        ${isRedirect ? 'bg-emerald-50 border-emerald-100' : 'bg-purple-50 border-purple-100'}
      `}>
        <h3 className={`font-semibold text-sm flex items-center gap-2 ${isRedirect ? 'text-emerald-800' : 'text-purple-800'}`}>
          {isRedirect ? <Globe size={16} /> : <Zap size={16} />}
          {isRedirect ? 'Redirect URL' : 'Trigger Action'}
        </h3>
        <div className="flex items-center gap-2">
          <select 
            className="text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5"
            value={actionConfig?.type || 'redirect'}
            onChange={(e) => handleUpdateConfig('type', e.target.value)}
          >
            <option value="redirect">Redirect</option>
            <option value="webhook">Webhook</option>
          </select>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNode();
            }}
            className={`p-1 rounded transition-colors ${isRedirect ? 'hover:bg-emerald-200 text-emerald-400 hover:text-emerald-700' : 'hover:bg-purple-200 text-purple-400 hover:text-purple-700'}`}
            title="Delete Block"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="p-3 space-y-3">
        {isRedirect ? (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Destination URL</label>
            <input 
              type="text" 
              className="text-xs w-full p-2 rounded border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="https://example.com/success"
              value={actionConfig?.url || ''}
              onChange={(e) => handleUpdateConfig('url', e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Webhook / Action ID</label>
            <input 
              type="text" 
              className="text-xs w-full p-2 rounded border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              placeholder="user_register_v1"
              value={actionConfig?.message || ''}
              onChange={(e) => handleUpdateConfig('message', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
});
