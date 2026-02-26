import type { Edge, Node } from '@xyflow/react';
import { AlertCircle, ArrowRight, Globe, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ActionConfig, ConditionRule, FormSection, FormField } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

const STORAGE_KEY = 'livePreviewFlow';

const randomLatency = () => Math.floor(200 + Math.random() * 1200); // 200ms to ~1.4s

interface LivePreviewProps {
  sections: FormSection[];
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ sections, nodes, edges, onClose }) => {
  const [loadedSections, setLoadedSections] = useState<FormSection[]>(sections);
  const [loadedNodes, setLoadedNodes] = useState<Node[]>(nodes);
  const [loadedEdges, setLoadedEdges] = useState<Edge[]>(edges);
  const [loading, setLoading] = useState(true);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | string[]>>({});
  const [_, setHistory] = useState<string[]>([]);
  const [actionResult, setActionResult] = useState<ActionConfig | null>(null);

  const renderField = (field: FormField) => {
    const value = formValues[field.id];

    if (field.type === 'text') {
      return (
        <Input
          type="text"
          className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
          value={(value as string) ?? ''}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        />
      );
    }

    if (field.type === 'long_text') {
      return (
        <Textarea
          className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
          value={(value as string) ?? ''}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select
          className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
          value={(value as string) ?? ''}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'radio') {
      return (
        <RadioGroup
          value={(value as string) ?? ''}
          onValueChange={(val) => handleInputChange(field.id, val)}
          className="space-y-2"
        >
          {field.options?.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <RadioGroupItem value={opt} />
              <span className="text-sm text-slate-700">{opt}</span>
            </label>
          ))}
        </RadioGroup>
      );
    }

    if (field.type === 'checkbox') {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => {
            const checked = arr.includes(opt);
            return (
              <label
                key={opt}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(val) => {
                    const next = val ? [...arr, opt] : arr.filter((o) => o !== opt);
                    handleInputChange(field.id, next);
                  }}
                />
                <span className="text-sm text-slate-700">{opt}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (field.type === 'rating') {
      const current = Number(value ?? 0) || 0;
      const max = field.ratingScale ?? 5;
      return (
        <div className="space-y-2">
          <Slider
            min={1}
            max={max}
            step={1}
            value={[current || Math.ceil(max / 2)]}
            onValueChange={(val) => handleInputChange(field.id, String(val[0]))}
          />
          <div className="text-xs text-slate-500">Selected: {current || Math.ceil(max / 2)} / {max}</div>
        </div>
      );
    }

    return null;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!sections.length && !nodes.length && !edges.length) return;
    const payload = { sections, nodes, edges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [sections, nodes, edges]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            sections?: FormSection[];
            nodes?: Node[];
            edges?: Edge[];
          };
          if (parsed.sections?.length) setLoadedSections(parsed.sections);
          if (parsed.nodes?.length) setLoadedNodes(parsed.nodes);
          if (parsed.edges?.length) setLoadedEdges(parsed.edges);
        } else if (sections.length || nodes.length || edges.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ sections, nodes, edges }));
        }
      } catch (err) {
        console.warn('Failed to hydrate preview data', err);
      } finally {
        setLoading(false);
      }
    }, randomLatency());

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && loadedSections.length > 0 && !currentSectionId) {
      setCurrentSectionId(loadedSections[0].id);
    }
  }, [loadedSections, currentSectionId, loading]);

  const currentSection = loadedSections.find((s) => s.id === currentSectionId);

  const handleInputChange = (fieldId: string, value: string | string[]) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const checkCondition = (rule: ConditionRule): boolean => {
    const fieldValue = formValues[rule.fieldId];
    if (fieldValue === undefined) return false;

    const valueAsString = Array.isArray(fieldValue) ? fieldValue.join(',') : fieldValue;

    switch (rule.operator) {
      case 'equals':
        return Array.isArray(fieldValue)
          ? fieldValue.includes(rule.value)
          : valueAsString === rule.value;
      case 'not_equals':
        return Array.isArray(fieldValue)
          ? !fieldValue.includes(rule.value)
          : valueAsString !== rule.value;
      case 'contains':
        return Array.isArray(fieldValue)
          ? fieldValue.includes(rule.value)
          : valueAsString.includes(rule.value);
      case 'greater_than':
        return Number(valueAsString) > Number(rule.value);
      case 'less_than':
        return Number(valueAsString) < Number(rule.value);
      case 'greater_equal':
        return Number(valueAsString) >= Number(rule.value);
      case 'less_equal':
        return Number(valueAsString) <= Number(rule.value);
      case 'is_empty':
        return Array.isArray(fieldValue)
          ? fieldValue.length === 0
          : valueAsString.trim() === '';
      case 'is_not_empty':
        return Array.isArray(fieldValue)
          ? fieldValue.length > 0
          : valueAsString.trim() !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!currentSectionId) return;

    const currentNode = loadedNodes.find((n) => n.id === currentSectionId);
    if (!currentNode) {
      const currentIndex = loadedSections.findIndex((s) => s.id === currentSectionId);
      if (currentIndex < loadedSections.length - 1) {
        setHistory((prev) => [...prev, currentSectionId]);
        setCurrentSectionId(loadedSections[currentIndex + 1].id);
      } else {
        setActionResult({ type: 'redirect', message: 'End of form (Default)' });
      }
      return;
    }

    const outgoingEdges = loadedEdges.filter((e) => e.source === currentNode.id);

    if (outgoingEdges.length === 0) {
      setActionResult({ type: 'redirect', message: 'End of form (No path)' });
      return;
    }

    const edge = outgoingEdges[0];
    const targetNode = loadedNodes.find((n) => n.id === edge.target);

    if (!targetNode) return;

    processNode(targetNode);
  };

  const processNode = (node: Node) => {
    if (node.type === 'sectionNode') {
      setHistory((prev) => [...prev, currentSectionId!]);
      setCurrentSectionId(node.id);
    } else if (node.type === 'actionNode') {
      const actionConfig = (node.data as any).actionConfig as ActionConfig;
      setActionResult(actionConfig);
    } else if (node.type === 'conditionNode') {
      const rules = (node.data as any).rules as ConditionRule[];

      let matchedRuleId: string | null = null;

      for (const rule of rules) {
        if (checkCondition(rule)) {
          matchedRuleId = rule.id;
          break;
        }
      }

      const conditionEdges = loadedEdges.filter((e) => e.source === node.id);

      let nextEdge: Edge | undefined;

      if (matchedRuleId) {
        nextEdge = conditionEdges.find((e) => e.sourceHandle === matchedRuleId);
      }

      if (!nextEdge) {
        nextEdge = conditionEdges.find((e) => e.sourceHandle === 'else');
      }

      if (nextEdge) {
        const nextNode = loadedNodes.find((n) => n.id === nextEdge.target);
        if (nextNode) {
          processNode(nextNode);
        } else {
          setActionResult({ type: 'redirect', message: 'Dead end' });
        }
      } else {
        setActionResult({ type: 'redirect', message: 'No matching condition path' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Preview
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" type="button">
            <AlertCircle size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-slate-600 text-sm">Simulando resposta do endpoint...</p>
            </div>
          ) : actionResult ? (
            <div className="text-center py-12 space-y-4">
              <div
                className={cn(
                  'w-16 h-16 mx-auto rounded-full flex items-center justify-center',
                  actionResult.type === 'redirect'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-purple-100 text-purple-600',
                )}
              >
                {actionResult.type === 'redirect' ? <Globe size={32} /> : <Zap size={32} />}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {actionResult.type === 'redirect' ? 'Redirecting...' : 'Action Triggered!'}
              </h3>
              <p className="text-slate-500">
                {actionResult.type === 'redirect'
                  ? `Destination: ${actionResult.url}`
                  : `Webhook: ${actionResult.message}`}
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                type="button"
              >
                Close Preview
              </button>
            </div>
          ) : currentSection ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">{currentSection.title}</h1>
                <p className="text-slate-500 text-sm">Please fill out the details below.</p>
              </div>

              <div className="space-y-5">
                {currentSection.fields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500">Loading section...</div>
          )}
        </div>

        {!actionResult && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
            >
              Next Step
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
