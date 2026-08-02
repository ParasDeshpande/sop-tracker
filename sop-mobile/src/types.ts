export interface User {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
  departmentId: string | null
}

export type FieldType = 'short_text' | 'long_text' | 'checkbox' | 'radio' | 'dropdown' | 'date' | 'time' | 'file_upload' | 'image' | 'section_header' | 'yes_no_na'

export interface FormField {
  id: string
  type: FieldType
  label: string
  required: boolean
  options?: string[]
  description?: string
}

export interface Template {
  id: string
  title: string
  description?: string
  departmentId: string
  fields: FormField[]
  department: { name: string }
}

export interface Submission {
  id: string
  title: string
  status: string
  submittedAt: string
  template: { title: string }
  department: { name: string }
  user: { name: string }
}

export interface ProjectTask {
  id: string
  status: string
  dueDate?: string
  notes?: string
  template: { id: string; title: string }
  project: { name: string; client: string }
  projectId: string
}

export interface NotificationItem {
  id: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}
