/**
 * Represents a task in the application
 */
export interface Task {
  /** Unique identifier for the task */
  id: string;
  
  /** Human-readable label for the task */
  label: string;
  
  /** Description of what the task entails */
  description?: string;
  
  /** Whether the task is required to proceed */
  required: boolean;
  
  /** Roles that can perform this task */
  requiredRoles?: string[];
  
  /** Current status of the task */
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
}

/**
 * Field option for select inputs
 */
export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

/**
 * Base field properties
 */
export interface BaseField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  description?: string;
  defaultValue?: any;
  placeholder?: string;
}

/**
 * Text input field
 */
export interface TextField extends BaseField {
  type: 'text' | 'email' | 'password' | 'date' | 'number';
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Textarea field
 */
export interface TextareaField extends BaseField {
  type: 'textarea';
  rows?: number;
}

/**
 * Checkbox field
 */
export interface CheckboxField extends BaseField {
  type: 'checkbox';
}

/**
 * Select field
 */
export interface SelectField extends BaseField {
  type: 'select';
  options: FieldOption[];
}

/**
 * Union type of all field types
 */
export type FormField = TextField | TextareaField | CheckboxField | SelectField;

/**
 * Form content for task action modals
 */
export interface TaskFormContent {
  title: string;
  description?: string;
  component?: string;
  fields?: FormField[];
} 