import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type React from 'react';
import { cn } from '@/lib/utils';
import type { FormSection } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface FormPreviewProps {
  sections: FormSection[];
  activeSectionId: string | null;
  onSectionSelect: (id: string | null) => void;
  onAddSection: () => void;
  onAddField: (sectionId: string) => void;
  onUpdateField: (
    sectionId: string,
    fieldId: string,
    updates: Partial<FormSection['fields'][number]>,
  ) => void;
  onRemoveField: (sectionId: string, fieldId: string) => void;
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  sections,
  activeSectionId,
  onSectionSelect,
  onAddSection,
  onAddField,
  onUpdateField,
  onRemoveField,
}) => {
  const renderFieldControls = (sectionId: string, field: FormSection['fields'][number]) => {
    const isOptionBased = field.type === 'select' || field.type === 'radio' || field.type === 'checkbox';
    return (
      <div className="space-y-3">
        <div className="flex gap-3 flex-wrap">
          <Input
            value={field.label}
            onChange={(e) => onUpdateField(sectionId, field.id, { label: e.target.value })}
            className="flex-1 min-w-[200px]"
            placeholder="Question text"
          />

          <Select
            value={field.type}
            onValueChange={(value) =>
              onUpdateField(sectionId, field.id, {
                type: value as any,
                ratingScale: value === 'rating' ? 5 : field.ratingScale,
              })
            }
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Short text</SelectItem>
              <SelectItem value="long_text">Long text</SelectItem>
              <SelectItem value="select">Dropdown</SelectItem>
              <SelectItem value="radio">Single choice (radio)</SelectItem>
              <SelectItem value="checkbox">Multiple choice (checkbox)</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox
              checked={!!field.required}
              onCheckedChange={(checked) =>
                onUpdateField(sectionId, field.id, { required: checked === true })
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

        {field.type === 'long_text' && (
          <Textarea disabled placeholder="Long answer..." className="min-h-[90px]" />
        )}

        {field.type === 'text' && <Input disabled placeholder="Short answer..." />}

        {field.type === 'rating' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Scale</span>
              <span>{field.ratingScale ?? 5} points</span>
            </div>
            <Slider
              min={4}
              max={10}
              step={1}
              value={[field.ratingScale ?? 5]}
              onValueChange={(val) => onUpdateField(sectionId, field.id, { ratingScale: val[0] })}
            />
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
                    const newOpts = (field.options ?? []).filter((_, i) => i !== idx);
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
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
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
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Form Preview</h1>
          <p className="text-slate-500 mt-2">
            Build your form structure here. Configure logic in the sidebar.
          </p>
        </div>

        {sections.map((section) => (
          <motion.div
            key={section.id}
            layoutId={section.id}
              onClick={() => onSectionSelect(section.id)}
              className={cn(
                'relative group rounded-xl border-2 transition-all duration-200 p-6 bg-white shadow-sm',
                activeSectionId === section.id
                  ? 'border-indigo-500 ring-4 ring-indigo-500/10'
                : 'border-slate-200 hover:border-slate-300',
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-400 cursor-grab active:cursor-grabbing">
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

              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 group/field hover:border-slate-300 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderFieldControls(section.id, field)}
                  </div>
                ))}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddField(section.id);
                }}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={18} />
                Add Field
              </button>
            </div>
          </motion.div>
        ))}

        <button
          onClick={onAddSection}
          className="w-full py-6 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2"
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
