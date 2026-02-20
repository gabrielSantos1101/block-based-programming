import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { Settings2, X, Play, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import type { FormSection } from '@/types';
import { FormPreview } from '@/components/FormBuilder/FormPreview';
import { LogicEditor } from '@/components/FormBuilder/LogicEditor';
import { LivePreview } from '@/components/FormBuilder/LivePreview';

const INITIAL_SECTIONS: FormSection[] = [
  {
    id: 'sec_1',
    title: 'Welcome & Basic Info',
    fields: [
      { id: 'f_1', type: 'text', label: 'What is your name?', required: true },
      { id: 'f_2', type: 'select', label: 'Select your department', options: ['Sales', 'Engineering', 'Support'] }
    ]
  },
  {
    id: 'sec_2',
    title: 'Engineering Details',
    fields: [
      { id: 'f_3', type: 'radio', label: 'Primary Language', options: ['TypeScript', 'Python', 'Rust'] }
    ]
  },
  {
    id: 'sec_3',
    title: 'Sales Targets',
    fields: [
      { id: 'f_4', type: 'text', label: 'Monthly Target ($)' }
    ]
  }
];

export const Route = createFileRoute('/')({
  component: FormBuilderPage,
})

function FormBuilderPage() {
  const [sections, setSections] = useState<FormSection[]>(INITIAL_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<string | null>('sec_1');
  const [isLogicOpen, setIsLogicOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const handleAddSection = () => {
    const newId = `sec_${sections.length + 1}`;
    setSections([...sections, {
      id: newId,
      title: 'New Section',
      fields: []
    }]);
    setActiveSectionId(newId);
  };

  const handleAddField = (sectionId: string) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          fields: [...sec.fields, {
            id: `f_${Date.now()}`,
            type: 'text',
            label: 'New Question'
          }]
        };
      }
      return sec;
    }));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      {/* Main Content Area (Form Builder) */}
      <div className="flex-1 flex flex-col h-full transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              LF
            </div>
            <span className="font-bold text-slate-800 tracking-tight">LogicFlow Builder</span>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setIsLogicOpen(!isLogicOpen)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isLogicOpen 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}
              `}
            >
              <Settings2 size={16} />
              {isLogicOpen ? 'Close Logic' : 'Logic Flow'}
            </button>
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Play size={16} />
              Preview
            </button>
          </div>
        </header>

        {/* Builder Canvas */}
        <FormPreview
          sections={sections}
          activeSectionId={activeSectionId}
          onSectionSelect={setActiveSectionId}
          onAddSection={handleAddSection}
          onAddField={handleAddField}
        />
      </div>

      <AnimatePresence mode="wait">
        {isLogicOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '60%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full border-l border-slate-200 bg-white shadow-xl relative z-20 flex flex-col"
          >
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Share2 size={16} className="text-indigo-500" />
                Logic Flow
              </h2>
              <button 
                onClick={() => setIsLogicOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <LogicEditor
                sections={sections} 
                activeSectionId={activeSectionId}
                onSectionSelect={setActiveSectionId}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                setNodes={setNodes}
                setEdges={setEdges}
              />
              
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                <div className="bg-white/90 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg text-xs text-slate-500">
                  <p className="font-medium text-slate-800 mb-1">How to use:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Drag nodes to rearrange sections</li>
                    <li>Add <strong>Condition Nodes</strong> to branch logic based on answers</li>
                    <li>Add <strong>Action Nodes</strong> to redirect or trigger webhooks</li>
                    <li>Connect nodes to define the flow</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPreviewOpen && (
          <LivePreview
            sections={sections}
            nodes={nodes}
            edges={edges}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
