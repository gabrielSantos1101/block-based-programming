export type FieldType =
  | 'text'
  | 'long_text'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'rating'
  | 'date'
  | 'time';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  options?: string[];
  required?: boolean;
  ratingScale?: number;
  ratingIcon?: 'radio' | 'star' | 'heart';
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormSchema {
  title: string;
  sections: FormSection[];
  startSectionId: string;
}

export type LogicNodeType = 'section' | 'condition' | 'action';

export interface ConditionRule {
  id: string;
  fieldId: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'greater_equal'
    | 'less_equal'
    | 'is_empty'
    | 'is_not_empty';
  value: string;
}

export interface ActionConfig {
  type: 'redirect' | 'webhook';
  url?: string;
  message?: string;
}

export interface LogicNodeData {
  label: string;
  type: LogicNodeType;
  sectionId?: string;
  fields?: FormField[];
  rules?: ConditionRule[];
  actionConfig?: ActionConfig;
}
