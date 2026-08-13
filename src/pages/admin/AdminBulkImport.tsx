import { useState, useCallback, useRef } from 'react'
import { Upload, Download, FileUp, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { supabase } from '@/lib/supabase'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParsedRow {
  rowNum: number
  title: string
  slug: string
  description: string
  main_image: string
  category_slug: string
  tags: string[]
  servings: number
  prep_time: number
  cook_time: number
  total_time: number
  ingredients: Ingredient[]
  instructions: Instruction[]
  author: string
  status: 'draft' | 'published'
  seo_title: string
  meta_description: string
  errors: string[]
}

interface Ingredient {
  quantity: string
  unit: string
  name: string
}

interface Instruction {
  step: number
  title: string
  content: string
}

interface ImportResult {
  rowNum: number
  title: string
  success: boolean
  error?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function parseIngredients(text: string): Ingredient[] {
  if (!text.trim()) return []
  return text
    .split('|')
    .map((item) => {
      const parts = item.trim().split(/\s+/)
      if (!parts.length || !parts[0]) return null
      const isNumeric = (s: string) => /^[\d.,½¼¾⅓⅔]+$/.test(s) || /^\d+\/\d+$/.test(s)
      if (isNumeric(parts[0])) {
        if (parts.length >= 3) return { quantity: parts[0], unit: parts[1], name: parts.slice(2).join(' ') }
        return { quantity: parts[0], unit: '', name: parts.slice(1).join(' ') }
      }
      return { quantity: '', unit: '', name: parts.join(' ') }
    })
    .filter((i): i is Ingredient => !!i && !!i.name)
}

function parseInstructions(text: string): Instruction[] {
  if (!text.trim()) return []
  return text
    .split('|')
    .map((item, idx) => ({ step: idx + 1, title: '', content: item.trim() }))
    .filter((i) => i.content)
}

/** Simple but correct CSV parser that handles quoted fields. */
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"' && inQuotes && next === '"') {
      field += '"'
      i++
    } else if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      row.push(field)
      field = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }

  if (field || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.some((f) => f.trim()))
}

function parseRows(csvRows: string[][]): ParsedRow[] {
  if (csvRows.length < 2) return []
  const headers = csvRows[0].map((h) => h.trim().toLowerCase())
  const get = (row: string[], key: string) => {
    const idx = headers.indexOf(key)
    return idx >= 0 ? (row[idx] ?? '').trim() : ''
  }

  return csvRows.slice(1).map((row, i) => {
    const errors: string[] = []
    const title = get(row, 'title')
    if (!title) errors.push('Title is required')

    const slugRaw = get(row, 'slug')
    const slug = slugRaw || slugify(title)
    if (!slug) errors.push('Could not generate a slug from the title')

    const servingsRaw = parseInt(get(row, 'servings') || '4', 10)
    const servings = isNaN(servingsRaw) || servingsRaw < 1 ? 4 : servingsRaw

    const prep_time = Math.max(0, parseInt(get(row, 'prep_time') || '0', 10) || 0)
    const cook_time = Math.max(0, parseInt(get(row, 'cook_time') || '0', 10) || 0)
    const total_time = prep_time + cook_time

    const statusRaw = get(row, 'status').toLowerCase()
    const status: 'draft' | 'published' = statusRaw === 'published' ? 'published' : 'draft'

    const tagsRaw = get(row, 'tags')
    const tags = tagsRaw ? tagsRaw.split('|').map((t) => t.trim()).filter(Boolean) : []

    return {
      rowNum: i + 2,
      title,
      slug,
      description: get(row, 'description'),
      main_image: get(row, 'main_image'),
      category_slug: get(row, 'category_slug'),
      tags,
      servings,
      prep_time,
      cook_time,
      total_time,
      ingredients: parseIngredients(get(row, 'ingredients')),
      instructions: parseInstructions(get(row, 'instructions')),
      author: get(row, 'author') || 'Recipet Team',
      status,
      seo_title: get(row, 'seo_title'),
      meta_description: get(row, 'meta_description'),
      errors,
    }
  })
}

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE_CSV = [
  'title,slug,description,main_image,category_slug,tags,servings,prep_time,cook_time,ingredients,instructions,author,status,seo_title,meta_description',
  '"Creamy Tomato Soup",,,"A warming bowl of blended tomato soup","dinner","soup|vegetarian|easy",4,10,20,"2 cans crushed tomatoes | 1 cup heavy cream | 1 onion diced | 2 cloves garlic","Sauté onion and garlic until soft | Add tomatoes and simmer 15 minutes | Blend until smooth | Stir in cream and season","Recipet Team","draft","Creamy Tomato Soup Recipe","A classic creamy tomato soup made with canned tomatoes and heavy cream."',
].join('\n')

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminBulkImport() {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'recipe-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a .csv file.')
      return
    }
    setFileName(file.name)
    setResults(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setRows(parseRows(parseCSV(text)))
    }
    reader.readAsText(file)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleImport = async () => {
    const validRows = rows.filter((r) => r.errors.length === 0)
    if (!validRows.length) return

    setImporting(true)
    const importResults: ImportResult[] = []

    try {
      // Fetch categories once and build a slug → id map
      const { data: cats } = await supabase.from('categories').select('id, slug')
      const catMap = new Map((cats ?? []).map((c) => [c.slug, c.id]))

      for (const row of validRows) {
        const categoryId = row.category_slug ? (catMap.get(row.category_slug) ?? null) : null
        const { error } = await supabase.from('recipes').insert({
          title: row.title,
          slug: row.slug,
          description: row.description || null,
          main_image: row.main_image || null,
          category_id: categoryId,
          tags: row.tags,
          servings: row.servings,
          prep_time: row.prep_time,
          cook_time: row.cook_time,
          total_time: row.total_time,
          ingredients: row.ingredients,
          instructions: row.instructions,
          author: row.author,
          status: row.status,
          seo_title: row.seo_title || null,
          meta_description: row.meta_description || null,
        })
        importResults.push({ rowNum: row.rowNum, title: row.title, success: !error, error: error?.message })
      }
    } catch (err) {
      console.error('[BulkImport]', err)
    }

    setResults(importResults)
    setImporting(false)

    if (importResults.every((r) => r.success)) {
      setRows([])
      setFileName('')
    }
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length
  const errorCount = rows.filter((r) => r.errors.length > 0).length
  const successCount = results?.filter((r) => r.success).length ?? 0
  const failCount = results?.filter((r) => !r.success).length ?? 0

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-7">
        <h1
          className="font-serif text-[#24211F] mb-1"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.75rem' }}
        >
          Bulk Import
        </h1>
        <p className="text-sm text-[#6F6862]">Upload a CSV file to create multiple recipes at once.</p>
      </div>

      {/* Import result banner */}
      {results && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm flex items-start gap-3 ${
            failCount === 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="text-lg leading-none mt-0.5">{failCount === 0 ? '✅' : '⚠️'}</span>
          <div>
            <p className="font-semibold mb-1">
              {successCount} recipe{successCount !== 1 ? 's' : ''} imported
              {failCount > 0 && `, ${failCount} failed`}
            </p>
            {results
              .filter((r) => !r.success)
              .map((r) => (
                <p key={r.rowNum} className="text-xs opacity-80">
                  Row {r.rowNum} ({r.title}): {r.error}
                </p>
              ))}
          </div>
        </div>
      )}

      {/* Step 1 — Download template */}
      <div className="bg-white border border-[#E9E1D8] rounded-xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <StepBadge n={1} />
          <h2 className="font-semibold text-[#24211F]">Download the CSV template</h2>
        </div>
        <p className="text-sm text-[#6F6862] mb-4 ml-10">
          Fill in one recipe per row. Use <code className="bg-[#F5EFE8] px-1 py-0.5 rounded text-xs">|</code> to
          separate multiple ingredients and instruction steps inside a cell.
        </p>
        <div className="ml-10">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5EFE8] text-[#24211F] rounded-lg text-sm font-medium hover:bg-[#EDE3D8] transition-colors"
            id="download-csv-template-btn"
          >
            <Download size={15} />
            Download template
          </button>
          <p className="text-xs text-[#9A9490] mt-2">
            Ingredients example: <code className="bg-[#F5EFE8] px-1 rounded">2 cups flour | 1 tsp salt | 3 eggs</code>
          </p>
          <p className="text-xs text-[#9A9490] mt-1">
            Instructions example: <code className="bg-[#F5EFE8] px-1 rounded">Mix dry ingredients | Add eggs | Bake 30 min</code>
          </p>
        </div>
      </div>

      {/* Step 2 — Upload CSV */}
      <div className="bg-white border border-[#E9E1D8] rounded-xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <StepBadge n={2} />
          <h2 className="font-semibold text-[#24211F]">Upload your CSV</h2>
        </div>
        <div
          className={`ml-10 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-[#E4573D] bg-[#FEF0EC]' : 'border-[#E9E1D8] hover:border-[#E4573D]/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload CSV file"
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={handleFileChange}
            id="csv-file-input"
          />
          <FileUp size={28} className="mx-auto mb-3 text-[#9A9490]" />
          {fileName ? (
            <p className="text-sm font-medium text-[#24211F]">📄 {fileName}</p>
          ) : (
            <>
              <p className="text-sm text-[#6F6862]">Drag & drop your CSV here, or click to browse</p>
              <p className="text-xs text-[#9A9490] mt-1">Only .csv files are accepted</p>
            </>
          )}
        </div>
      </div>

      {/* Step 3 — Preview & Import */}
      {rows.length > 0 && (
        <div className="bg-white border border-[#E9E1D8] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <StepBadge n={3} />
              <div>
                <h2 className="font-semibold text-[#24211F]">Preview &amp; Import</h2>
                <p className="text-xs text-[#6F6862] mt-0.5">
                  {rows.length} row{rows.length !== 1 ? 's' : ''} detected ·{' '}
                  <span className="text-green-700 font-medium">{validCount} valid</span>
                  {errorCount > 0 && (
                    <> · <span className="text-red-600 font-medium">{errorCount} with errors</span></>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              id="bulk-import-submit-btn"
            >
              {importing ? (
                <><Loader2 size={15} className="animate-spin" /> Importing…</>
              ) : (
                <><Upload size={15} /> Import {validCount} Recipe{validCount !== 1 ? 's' : ''}</>
              )}
            </button>
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto rounded-lg border border-[#E9E1D8]">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-[#F7F3EF] text-[#6F6862] text-xs uppercase tracking-wide">
                <tr>
                  {['#', 'Title', 'Slug', 'Category', 'Tags', 'Servings', 'Time', 'Status', ''].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const hasError = row.errors.length > 0
                  return (
                    <tr
                      key={row.rowNum}
                      className={`border-t border-[#E9E1D8] ${hasError ? 'bg-red-50' : 'hover:bg-[#FAFAF9]'}`}
                    >
                      <td className="px-3 py-2.5 text-[#9A9490] text-xs">{row.rowNum}</td>
                      <td className="px-3 py-2.5 font-medium text-[#24211F] max-w-[160px] truncate">
                        {row.title || <span className="text-red-500 italic text-xs">Missing</span>}
                      </td>
                      <td className="px-3 py-2.5 text-[#6F6862] font-mono text-xs max-w-[130px] truncate">{row.slug}</td>
                      <td className="px-3 py-2.5 text-[#6F6862] text-xs">{row.category_slug || '—'}</td>
                      <td className="px-3 py-2.5 text-[#6F6862] text-xs max-w-[110px] truncate">{row.tags.join(', ') || '—'}</td>
                      <td className="px-3 py-2.5 text-[#6F6862] text-xs">{row.servings}</td>
                      <td className="px-3 py-2.5 text-[#6F6862] text-xs whitespace-nowrap">{row.total_time}m</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            row.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {hasError ? (
                          <span title={row.errors.join(', ')}>
                            <XCircle size={16} className="text-red-500" />
                          </span>
                        ) : (
                          <CheckCircle size={16} className="text-green-500" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Error detail panel */}
          {errorCount > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1.5">
                <AlertCircle size={13} /> Rows with errors will be skipped during import:
              </p>
              {rows
                .filter((r) => r.errors.length > 0)
                .map((r) => (
                  <p key={r.rowNum} className="text-xs text-red-600">
                    Row {r.rowNum}{r.title ? ` (${r.title})` : ''}: {r.errors.join(', ')}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

// Small helper component
function StepBadge({ n }: { n: number }) {
  return (
    <div className="w-7 h-7 rounded-full bg-[#E4573D] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </div>
  )
}
