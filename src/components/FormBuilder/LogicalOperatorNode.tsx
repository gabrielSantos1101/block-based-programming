import { Handle, type NodeProps, Position, useReactFlow } from '@xyflow/react';
import { Plus, Trash2, X } from 'lucide-react';
import { memo } from 'react';

interface LogicalOperatorNodeData {
  label: string;
  operator: 'AND' | 'OR' | 'NOT';
  inputs: number;
}

const operatorConfig = {
  AND: {
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    hoverBg: 'hover:bg-blue-100',
    ringColor: 'ring-blue-500/20',
    selectedBorder: 'border-blue-500',
    handleColor: '!bg-blue-500',
    description: 'All inputs must be true',
  },
  OR: {
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    hoverBg: 'hover:bg-green-100',
    ringColor: 'ring-green-500/20',
    selectedBorder: 'border-green-500',
    handleColor: '!bg-green-500',
    description: 'At least one input must be true',
  },
  NOT: {
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    hoverBg: 'hover:bg-red-100',
    ringColor: 'ring-red-500/20',
    selectedBorder: 'border-red-500',
    handleColor: '!bg-red-500',
    description: 'Inverts the input (true becomes false, false becomes true)',
  },
};

export const LogicalOperatorNode = memo(({ id, data, selected }: NodeProps) => {
  const { operator = 'AND', inputs = 2 } = data as unknown as LogicalOperatorNodeData;
  const { updateNodeData, deleteElements } = useReactFlow();
  const config = operatorConfig[operator];

  const handleDeleteNode = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const handleAddInput = () => {
    if (operator !== 'NOT' && inputs < 5) {
      updateNodeData(id, { inputs: inputs + 1 });
    }
  };

  const handleRemoveInput = () => {
    if (inputs > (operator === 'NOT' ? 1 : 2)) {
      updateNodeData(id, { inputs: inputs - 1 });
    }
  };

  const handleChangeOperator = (newOperator: 'AND' | 'OR' | 'NOT') => {
    const newInputs = newOperator === 'NOT' ? 1 : inputs;
    updateNodeData(id, { operator: newOperator, inputs: newInputs });
  };

  return (
    <div
      className={`
      bg-white rounded-lg border-2 shadow-lg min-w-[280px] overflow-hidden transition-all group
      ${selected ? `${config.selectedBorder} ring-2 ${config.ringColor}` : 'border-slate-200'}
    `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="bg-slate-400! w-3! h-3! hover:bg-slate-600! transition-colors"
      />

      <div
        className={`${config.bgColor} border-b ${config.borderColor} p-3 flex justify-between items-center`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold ${config.textColor} bg-white px-2 py-1 rounded border ${config.borderColor}`}
          >
            {operator}
          </span>
          <h3 className={`font-semibold ${config.textColor} text-sm`}>Logical Operator</h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteNode();
          }}
          className={`p-1 ${config.hoverBg} rounded text-slate-400 hover:text-red-600 transition-colors`}
          title="Delete Block"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        <div className="flex gap-1.5">
          {(['AND', 'OR', 'NOT'] as const).map((op) => (
            <button
              key={op}
              onClick={() => handleChangeOperator(op)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-all ${
                operator === op
                  ? `${config.bgColor} ${config.borderColor} ${config.textColor}`
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {op}
            </button>
          ))}
        </div>

        <div
          className={`text-xs ${config.textColor} bg-white p-2 rounded border ${config.borderColor} italic`}
        >
          {config.description}
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Inputs ({inputs})
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: inputs }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`input_${index}`}
                  className={`${config.handleColor.replace('!', '')}! w-3! h-3!`}
                />
                <span className="text-xs text-slate-500 flex-1">Input {index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {operator !== 'NOT' && (
          <div className="flex gap-2">
            <button
              onClick={handleAddInput}
              disabled={inputs >= 5}
              className="flex-1 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-blue-200 flex items-center justify-center gap-1 transition-colors"
            >
              <Plus size={12} />
              Add Input
            </button>
            <button
              onClick={handleRemoveInput}
              disabled={inputs <= 2}
              className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-red-200 flex items-center justify-center gap-1 transition-colors"
            >
              <X size={12} />
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-2 border-t border-slate-100 flex justify-end items-center relative">
        <span className="text-xs text-slate-500 mr-3 font-medium">Output</span>
        <Handle
          type="source"
          position={Position.Right}
          className={`${config.handleColor.replace('!', '')}! w-3! h-3!`}
        />
      </div>
    </div>
  );
});

LogicalOperatorNode.displayName = 'LogicalOperatorNode';
