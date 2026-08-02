// Google Forms-style field types
export type FieldType = 'short_text' | 'long_text' | 'checkbox' | 'radio' | 'dropdown' | 'date' | 'time' | 'file_upload' | 'image' | 'section_header' | 'yes_no_na'

export interface FormField {
  id: string
  type: FieldType
  label: string
  required: boolean
  options?: string[] // for radio, dropdown, checkbox
  description?: string
  accept?: string // for file_upload: e.g. "image/*,.pdf"
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  short_text: 'Short Answer',
  long_text: 'Paragraph',
  checkbox: 'Checkboxes',
  radio: 'Multiple Choice',
  dropdown: 'Dropdown',
  date: 'Date',
  time: 'Time',
  file_upload: 'File Upload',
  image: 'Image Upload',
  section_header: 'Section Header',
  yes_no_na: 'Yes / No / NA',
}

export function generateFieldId(): string {
  return 'f_' + Math.random().toString(36).substring(2, 10)
}
