import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { apiGet, apiFetch } from '../../src/api'
import { Template, FormField } from '../../src/types'
import { colors, spacing, radius, fontSize } from '../../src/theme'

export default function FillSOPScreen() {
  const { id, projectSOPId, projectId } = useLocalSearchParams<{ id: string; projectSOPId?: string; projectId?: string }>()
  const [template, setTemplate] = useState<Template | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, any>>({})
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    apiGet<Template>(`/api/templates/${id}`).then(t => { setTemplate(t); setTitle(t.title) })
  }, [id])

  const update = (fieldId: string, value: any) => setResponses(prev => ({ ...prev, [fieldId]: value }))

  const pickImage = async (fieldId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
    if (!result.canceled && result.assets[0]) {
      setFiles(prev => ({ ...prev, [fieldId]: result.assets[0] }))
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return }
    // Validate required fields
    for (const field of template!.fields) {
      if (!field.required || field.type === 'section_header') continue
      const val = responses[field.id]
      if ((field.type === 'file_upload' || field.type === 'image') && !files[field.id]) { Alert.alert('Required', `"${field.label}" is required`); return }
      if (field.type === 'checkbox' && (!val || val.length === 0)) { Alert.alert('Required', `"${field.label}" is required`); return }
      if (!val && field.type !== 'file_upload' && field.type !== 'image') { Alert.alert('Required', `"${field.label}" is required`); return }
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append('templateId', id!)
    formData.append('title', title)
    formData.append('projectId', projectId || '')
    formData.append('projectSOPId', projectSOPId || '')
    formData.append('responses', JSON.stringify(responses))

    // Append files
    for (const [fieldId, asset] of Object.entries(files)) {
      if (asset?.uri) {
        const filename = asset.fileName || `photo_${Date.now()}.jpg`
        formData.append(fieldId, { uri: asset.uri, name: filename, type: asset.mimeType || 'image/jpeg' } as any)
      }
    }

    const res = await apiFetch('/api/submissions', { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } })

    if (res.ok) {
      Alert.alert('Success', 'SOP submitted successfully!', [{ text: 'OK', onPress: () => router.back() }])
    } else {
      const err = await res.json().catch(() => ({}))
      Alert.alert('Error', err.error || 'Submission failed')
    }
    setSubmitting(false)
  }

  if (!template) return <View style={styles.center}><Text>Loading...</Text></View>

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Fill SOP', headerStyle: { backgroundColor: colors.primary }, headerTintColor: colors.white }} />
      <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
        {/* Title input */}
        <View style={styles.card}>
          <Text style={styles.label}>SOP Title <Text style={styles.req}>*</Text></Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" />
        </View>

        {/* Fields */}
        {template.fields.map(field => (
          <View key={field.id} style={styles.card}>
            {field.type === 'section_header' ? (
              <Text style={styles.sectionHeader}>{field.label}</Text>
            ) : (
              <>
                <Text style={styles.label}>{field.label} {field.required && <Text style={styles.req}>*</Text>}</Text>
                {renderField(field, responses[field.id], (v) => update(field.id, v), files[field.id], () => pickImage(field.id))}
              </>
            )}
          </View>
        ))}

        <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.8}>
          <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit SOP'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  )
}

function renderField(field: FormField, value: any, onChange: (v: any) => void, fileAsset: any, pickImage: () => void) {
  switch (field.type) {
    case 'short_text':
      return <TextInput style={styles.input} value={value || ''} onChangeText={onChange} placeholder="Your answer" />
    case 'long_text':
      return <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={value || ''} onChangeText={onChange} multiline placeholder="Your answer" />
    case 'date':
      return <TextInput style={styles.input} value={value || ''} onChangeText={onChange} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
    case 'time':
      return <TextInput style={styles.input} value={value || ''} onChangeText={onChange} placeholder="HH:MM" keyboardType="numbers-and-punctuation" />
    case 'yes_no_na':
      return (
        <View style={styles.yesNoRow}>
          {['YES', 'NO', 'NA'].map(opt => (
            <TouchableOpacity key={opt} style={[styles.yesNoBtn, value === opt && { backgroundColor: opt === 'YES' ? colors.success : opt === 'NO' ? colors.danger : colors.gray[500] }]} onPress={() => onChange(opt)} activeOpacity={0.7}>
              <Text style={[styles.yesNoText, value === opt && { color: colors.white }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )
    case 'radio':
    case 'dropdown':
      return (
        <View style={{ gap: spacing.sm }}>
          {field.options?.map(opt => (
            <TouchableOpacity key={opt} style={styles.optionRow} onPress={() => onChange(opt)} activeOpacity={0.7}>
              <View style={[styles.radioCircle, value === opt && styles.radioFilled]} />
              <Text style={styles.optionLabel}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )
    case 'checkbox':
      const selected: string[] = value || []
      return (
        <View style={{ gap: spacing.sm }}>
          {field.options?.map(opt => (
            <TouchableOpacity key={opt} style={styles.optionRow} onPress={() => onChange(selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt])} activeOpacity={0.7}>
              <View style={[styles.checkBox, selected.includes(opt) && styles.checkBoxChecked]} />
              <Text style={styles.optionLabel}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )
    case 'image':
    case 'file_upload':
      return (
        <View>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} activeOpacity={0.7}>
            <Text style={styles.uploadText}>{fileAsset ? '✓ Change file' : '📎 Choose file'}</Text>
          </TouchableOpacity>
          {fileAsset?.uri && field.type === 'image' && <Image source={{ uri: fileAsset.uri }} style={styles.previewImage} />}
          {fileAsset && <Text style={styles.fileName}>{fileAsset.fileName || 'Selected'}</Text>}
        </View>
      )
    default:
      return null
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.sm, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[700], marginBottom: spacing.sm },
  req: { color: colors.danger },
  sectionHeader: { fontSize: fontSize.lg, fontWeight: '700', color: colors.gray[700], borderBottomWidth: 2, borderBottomColor: colors.gray[200], paddingBottom: spacing.sm },
  input: { borderBottomWidth: 1, borderBottomColor: colors.gray[200], paddingVertical: spacing.sm, fontSize: fontSize.md },
  yesNoRow: { flexDirection: 'row', gap: spacing.md },
  yesNoBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray[200], alignItems: 'center' },
  yesNoText: { fontWeight: '700', fontSize: fontSize.sm, color: colors.gray[700] },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.gray[300] },
  radioFilled: { borderColor: colors.primary, backgroundColor: colors.primary },
  checkBox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.gray[300] },
  checkBoxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionLabel: { fontSize: fontSize.md, color: colors.gray[700] },
  uploadBtn: { backgroundColor: colors.gray[100], paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.md, alignSelf: 'flex-start' },
  uploadText: { fontSize: fontSize.sm, color: colors.gray[700], fontWeight: '500' },
  previewImage: { width: '100%', height: 160, borderRadius: radius.md, marginTop: spacing.md, resizeMode: 'cover' },
  fileName: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: spacing.xs },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: radius.lg, alignItems: 'center', marginTop: spacing.lg },
  submitText: { color: colors.white, fontWeight: '700', fontSize: fontSize.md },
})
