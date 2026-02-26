import { createFileRoute } from '@tanstack/react-router';
import type { Edge, Node } from '@xyflow/react';
import { useEdgesState, useNodesState } from '@xyflow/react';
import { Play, Save, Settings2, Share2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { FormPreview } from '@/components/FormBuilder/FormPreview';
import { LivePreview } from '@/components/FormBuilder/LivePreview';
import { LogicEditor } from '@/components/FormBuilder/LogicEditor';
import type { FormSection } from '@/types';

const INITIAL_SECTIONS: FormSection[] = [
  {
    id: 'sec_1',
    title: 'Welcome & Basic Info',
    fields: [
      { id: 'f_1', type: 'text', label: 'What is your name?', required: true },
      {
        id: 'f_2',
        type: 'select',
        label: 'Select your department',
        options: ['Sales', 'Engineering', 'Support'],
      },
    ],
  },
  {
    id: 'sec_2',
    title: 'Engineering Details',
    fields: [
      {
        id: 'f_3',
        type: 'radio',
        label: 'Primary Language',
        options: ['TypeScript', 'Python', 'Rust'],
      },
    ],
  },
  {
    id: 'sec_3',
    title: 'Sales Targets',
    fields: [{ id: 'f_4', type: 'text', label: 'Monthly Target ($)' }],
  },
];

export const Route = createFileRoute('/')({
  component: FormBuilderPage,
});

function FormBuilderPage() {
  const STORAGE_KEY = 'livePreviewFlow';
  const [sections, setSections] = useState<FormSection[]>(INITIAL_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<string | null>('sec_1');
  const [isLogicOpen, setIsLogicOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(() => {
    const stored = localStorage.getItem('hideHowToUse');
    return stored !== 'true';
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as {
        sections?: FormSection[];
        nodes?: Node[];
        edges?: Edge[];
      };
      if (parsed.sections?.length) {
        setSections(parsed.sections);
        setActiveSectionId(parsed.sections[0]?.id ?? null);
      }
      if (parsed.nodes?.length) setNodes(parsed.nodes);
      if (parsed.edges?.length) setEdges(parsed.edges);
    } catch (err) {
      console.warn('Falha ao carregar dados salvos', err);
    }
  }, [setEdges, setNodes]);

  const handleSave = () => {
    if (typeof window === 'undefined') return;
    try {
      const payload = { sections, nodes, edges };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Falha ao salvar fluxo', err);
    }
  };

  const handleAddSection = () => {
    const newId = `sec_${sections.length + 1}`;
    setSections([
      ...sections,
      {
        id: newId,
        title: 'New Section',
        fields: [],
      },
    ]);
    setActiveSectionId(newId);

    const prevId = sections[sections.length - 1]?.id;
    if (prevId) {
      setEdges((eds) => {
        const edgeId = `edge_${prevId}_${newId}`;
        if (eds.some((e) => e.id === edgeId)) return eds;
        return [
          ...eds,
          {
            id: edgeId,
            source: prevId,
            target: newId,
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: { type: 'arrowclosed', color: '#94a3b8' },
          } as Edge,
        ];
      });
    }
  };

  const handleAddField = (sectionId: string) => {
    setSections(
      sections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            fields: [
              ...sec.fields,
              {
                id: `f_${Date.now()}`,
                type: 'text',
                label: 'New Question',
              },
            ],
          };
        }
        return sec;
      })
    );
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
                ${
                  isLogicOpen
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }
              `}
              type="button"
            >
              <Settings2 size={16} />
              {isLogicOpen ? 'Close Logic' : 'Logic Flow'}
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              type="button"
            >
              <Play size={16} />
              Preview
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              type="button"
            >
              <Save size={16} />
              Salvar
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
                type="button"
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
                {showHowToUse && (
                  <div className="bg-white/90 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg text-xs text-slate-500 pointer-events-auto">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 mb-1">How to use:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Drag nodes to rearrange sections</li>
                          <li>
                            Add <strong>Condition Nodes</strong> to branch logic based on answers
                          </li>
                          <li>
                            Add <strong>Action Nodes</strong> to redirect or trigger webhooks
                          </li>
                          <li>Connect nodes to define the flow</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => {
                          setShowHowToUse(false);
                          localStorage.setItem('hideHowToUse', 'true');
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mt-0.5"
                        title="Close"
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
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
