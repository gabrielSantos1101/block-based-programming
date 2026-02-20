import React from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { FormSection } from '@/types';

interface FormPreviewProps {
  sections: FormSection[];
  activeSectionId: string | null;
  onSectionSelect: (id: string | null) => void;
  onAddSection: () => void;
  onAddField: (sectionId: string) => void;
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  sections,
  activeSectionId,
  onSectionSelect,
  onAddSection,
  onAddField,
}) => {
  return (
    <div className="flex-1 bg-slate-50 h-full overflow-y-auto p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Form Preview</h1>
          <p className="text-slate-500 mt-2">Build your form structure here. Configure logic in the sidebar.</p>
        </div>

        {sections.map((section) => (
          <motion.div
            key={section.id}
            layoutId={section.id}
            onClick={() => onSectionSelect(section.id)}
            className={`
              relative group rounded-xl border-2 transition-all duration-200 p-6 bg-white shadow-sm
              ${activeSectionId === section.id 
                ? 'border-indigo-500 ring-4 ring-indigo-500/10' 
                : 'border-slate-200 hover:border-slate-300'}
            `}
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
                <div key={field.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 group/field hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      {field.label}
                    </label>
                    <button className="text-slate-400 hover:text-red-500 opacity-0 group-hover/field:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {field.type === 'text' && (
                    <input disabled type="text" className="w-full rounded-md border-slate-300 bg-white shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed" placeholder="Text answer..." />
                  )}
                  
                  {field.type === 'select' && (
                    <select disabled className="w-full rounded-md border-slate-300 bg-white shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                      <option>Select an option...</option>
                      {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  )}

                  {field.type === 'radio' && (
                    <div className="space-y-2">
                      {field.options?.map(opt => (
                        <div key={opt} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
                          <span className="text-sm text-slate-600">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
