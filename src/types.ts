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
  /**
   * Persisted identifier from backend. Undefined means the field was not created server-side yet.
   */
  backendId?: string;
  type: FieldType;
  label: string;
  options?: string[];
  required?: boolean;
  ratingScale?: number;
  ratingIcon?: 'radio' | 'star' | 'heart';
}

export interface FormSection {
  id: string;
  /**
   * Persisted identifier from backend. Undefined means the section was not created server-side yet.
   */
  backendId?: string;
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
  /**
   * Field identifier from the UI layer. Use `fieldBackendId` when already persisted.
   */
  fieldBackendId?: string;
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
  sectionBackendId?: string;
  fields?: FormField[];
  rules?: ConditionRule[];
  actionConfig?: ActionConfig;
  backendId?: string;
}

export interface ApiFieldPayload {
  /** Persisted id when it already exists in backend */
  id?: string;
  /** Frontend/local identifier to correlate optimistic updates */
  clientId: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[];
  ratingScale?: number;
  ratingIcon?: 'radio' | 'star' | 'heart';
  position: number;
}

export interface ApiSectionPayload {
  id?: string;
  clientId: string;
  title: string;
  position: number;
  fields: ApiFieldPayload[];
}

export interface ApiLogicNodePayload {
  id?: string;
  clientId: string;
  type: LogicNodeType;
  sectionId?: string;
  rules?: ConditionRule[];
  actionConfig?: ActionConfig;
  position?: { x: number; y: number };
}

export interface ApiLogicEdgePayload {
  id?: string;
  clientId: string;
  sourceClientId: string;
  targetClientId: string;
}

export interface FormApiPayload {
  title: string;
  startSectionId: string | null;
  sections: ApiSectionPayload[];
  logic: {
    nodes: ApiLogicNodePayload[];
    edges: ApiLogicEdgePayload[];
  };
}
