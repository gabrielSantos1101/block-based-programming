import type {
  Connection,
  Edge,
  Node,
  NodeProps,
  OnEdgesChange,
  OnNodesChange,
} from '@xyflow/react';
import {
  addEdge,
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
} from '@xyflow/react';
import type React from 'react';
import { memo, useCallback, useEffect, useMemo } from 'react';
import '@xyflow/react/dist/style.css';
import { GitBranch, Split, Zap } from 'lucide-react';
import type { FormField, FormSection } from '@/types';
import { cn } from '@/lib/utils';
import { ActionNode } from './ActionNode';
import { ConditionNode } from './ConditionNode';
import { LogicalOperatorNode } from './LogicalOperatorNode';

interface LogicEditorProps {
  sections: FormSection[];
  activeSectionId: string | null;
  onSectionSelect: (id: string | null) => void;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const SectionNode = memo(({ data, selected }: NodeProps) => {
  const { label, fields } = data as { label: string; fields: FormField[] };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border-2 shadow-sm min-w-[250px] overflow-hidden transition-colors',
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200',
      )}
    >
      <Handle type="target" position={Position.Top} className="bg-slate-400! w-3! h-3!" />

      <div className="bg-slate-50 border-b border-slate-100 p-3">
        <h3 className="font-semibold text-slate-800 text-sm">{label}</h3>
      </div>

      <div className="p-3 space-y-2">
        {fields.length === 0 && <p className="text-xs text-slate-400 italic">No fields yet</p>}
        {fields.slice(0, 3).map((f) => (
          <div key={f.id} className="text-xs text-slate-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <span className="truncate">{f.label}</span>
          </div>
        ))}
        {fields.length > 3 && (
          <p className="text-xs text-slate-400 pl-3.5">+ {fields.length - 3} more fields</p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="bg-primary! w-3! h-3!" />
    </div>
  );
});

export const LogicEditor: React.FC<LogicEditorProps> = ({
  sections,
  activeSectionId,
  onSectionSelect,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
}) => {
  const nodeTypes = useMemo(
    () => ({
      sectionNode: SectionNode,
      conditionNode: ConditionNode,
      actionNode: ActionNode,
      logicalOperatorNode: LogicalOperatorNode,
    }),
    [],
  );

  useEffect(() => {
    setNodes((nds) => {
      const currentSectionNodes = nds.filter((n) => n.type === 'sectionNode');
      const otherNodes = nds.filter((n) => n.type !== 'sectionNode');

      const newSectionNodes = sections.map((section, index) => {
        const existingNode = currentSectionNodes.find((n) => n.id === section.id);

        const newNodeData = {
          label: section.title,
          fields: section.fields,
        };

        if (existingNode) {
          return {
            ...existingNode,
            data: newNodeData,
          };
        }

        return {
          id: section.id,
          type: 'sectionNode',
          data: newNodeData,
          position: { x: 50, y: index * 300 },
        };
      });

      const updatedOtherNodes = otherNodes.map((node) => {
        if (node.type === 'conditionNode') {
          return {
            ...node,
            data: {
              ...node.data,
              availableSections: sections,
            },
          };
        }
        return node;
      });

      return [...newSectionNodes, ...updatedOtherNodes];
    });
  }, [sections, setNodes]);

  useEffect(() => {
    setEdges((eds) => {
      // Se já há arestas salvas (ex.: carregadas do localStorage), não sobrescreve.
      if (eds.length > 0) return eds;

      const sectionEdges = sections
        .map((section, index) => {
          if (index < sections.length - 1) {
            return {
              id: `edge_${section.id}_${sections[index + 1].id}`,
              source: section.id,
              target: sections[index + 1].id,
              animated: true,
              style: { stroke: '#94a3b8', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#94a3b8',
              },
            } as Edge;
          }
          return null;
        })
        .filter((edge): edge is Edge => edge !== null);

      const otherEdges = eds.filter(
        (e) =>
          !sections.some((s) => e.source === s.id && sections.some((s2) => e.target === s2.id)),
      );

      return [...sectionEdges, ...otherEdges];
    });
  }, [sections, setEdges]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: node.id === activeSectionId,
      })),
    );
  }, [activeSectionId, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (sourceNode?.type === 'sectionNode' && targetNode?.type === 'logicalOperatorNode') {
        console.warn('Cannot connect a Section directly to a Logical Operator');
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94a3b8',
            },
          } as Edge,
          eds,
        ),
      );
    },
    [setEdges, nodes],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges],
  );

  const addNode = (type: 'condition' | 'action' | 'and' | 'or' | 'not') => {
    const id = `${type}_${Date.now()}`;
    const position = { x: 400, y: 100 };

    if (type === 'condition') {
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: 'conditionNode',
          position,
          data: {
            label: 'Condition',
            rules: [],
            availableSections: sections,
          },
        },
      ]);
    } else if (type === 'action') {
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: 'actionNode',
          position,
          data: {
            label: 'Action',
            actionConfig: { type: 'redirect', url: '' },
          },
        },
      ]);
    } else {
      const operatorMap = { and: 'AND', or: 'OR', not: 'NOT' } as const;
      const operator = operatorMap[type as keyof typeof operatorMap];
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: 'logicalOperatorNode',
          position,
          data: {
            label: operator,
            operator,
            inputs: operator === 'NOT' ? 1 : 2,
          },
        },
      ]);
    }
  };

  return (
    <div className="w-full h-full bg-slate-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onNodeClick={(_, node) => {
          if (node.type === 'sectionNode') {
            onSectionSelect(node.id);
          } else {
            onSectionSelect(null);
          }
        }}
        onPaneClick={() => onSectionSelect(null)}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />

        <Panel
          position="top-left"
          className="bg-white p-2 rounded-lg shadow-md border border-slate-200 flex gap-2 flex-wrap"
        >
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-1 px-2 w-full">
            Add Node:
          </div>
          <button
            onClick={() => addNode('condition')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 border border-orange-200 text-xs font-medium transition-colors"
          >
            <Split size={14} />
            Condition
          </button>
          <button
            onClick={() => addNode('action')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 border border-purple-200 text-xs font-medium transition-colors"
          >
            <Zap size={14} />
            Action
          </button>
          <button
            onClick={() => addNode('and')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 border border-blue-200 text-xs font-medium transition-colors"
          >
            <GitBranch size={14} />
            AND
          </button>
          <button
            onClick={() => addNode('or')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200 text-xs font-medium transition-colors"
          >
            <GitBranch size={14} />
            OR
          </button>
          <button
            onClick={() => addNode('not')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200 text-xs font-medium transition-colors"
          >
            <GitBranch size={14} />
            NOT
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
