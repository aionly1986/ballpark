// Syncs data/pages-tracker.csv into the Ballpark Google Sheet.
// Source of truth is the CSV in the repo; this pushes it to the Sheet with a
// styled header, frozen top row, dropdowns (data validation) on the status
// columns, and colour-coded conditional formatting. Re-run any time the CSV
// changes:  node scripts/sync-sheet.mjs
//
// Auth: a service account whose JSON key lives at ./google-service-account.json
// (gitignored). Share the Sheet with that service account's client_email as an
// Editor for this to work.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { google } from 'googleapis'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SPREADSHEET_ID = '1Cse-ImZB7tD6V67f_tqlDwO9ziLb-a_xnBW444yjcHU'
const CSV_PATH = join(ROOT, 'data', 'pages-tracker.csv')
const KEY_PATH = join(ROOT, 'google-service-account.json')

// --- Column setup (0-based indexes into the CSV / sheet) ---------------------
const COL = {
  status: 10,
  deployed: 11,
  sitemap: 12,
  indexed: 13,
}

const DROPDOWNS = [
  { col: COL.status, values: ['Live', 'Building', 'Planned', 'Paused'] },
  { col: COL.deployed, values: ['Yes', 'No'] },
  { col: COL.sitemap, values: ['Yes', 'No'] },
  { col: COL.indexed, values: ['Yes', 'Pending', 'No'] },
]

// Soft fills that match the site's palette.
const GREEN = { red: 0.847, green: 0.933, blue: 0.831 }
const AMBER = { red: 0.996, green: 0.925, blue: 0.776 }
const RED = { red: 0.965, green: 0.831, blue: 0.816 }
const GRAY = { red: 0.925, green: 0.937, blue: 0.945 }

const COLOR_RULES = [
  { col: COL.status, text: 'Live', color: GREEN },
  { col: COL.status, text: 'Building', color: AMBER },
  { col: COL.status, text: 'Planned', color: GRAY },
  { col: COL.status, text: 'Paused', color: RED },
  { col: COL.deployed, text: 'Yes', color: GREEN },
  { col: COL.deployed, text: 'No', color: RED },
  { col: COL.sitemap, text: 'Yes', color: GREEN },
  { col: COL.sitemap, text: 'No', color: RED },
  { col: COL.indexed, text: 'Yes', color: GREEN },
  { col: COL.indexed, text: 'Pending', color: AMBER },
  { col: COL.indexed, text: 'No', color: RED },
]

// --- Minimal RFC-4180 CSV parser (handles quoted fields with commas) ---------
function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((x) => x !== ''))
}

// Turn numeric-looking strings into real numbers so Sheets right-aligns them.
function coerce(value) {
  if (value === '' || value == null) return ''
  const n = Number(value.replace(/,/g, ''))
  return value.trim() !== '' && Number.isFinite(n) && /^[\d.,]+$/.test(value) ? n : value
}

async function main() {
  const csv = readFileSync(CSV_PATH, 'utf8')
  const rows = parseCSV(csv)
  const header = rows[0]
  const values = rows.map((r, ri) => (ri === 0 ? r : r.map(coerce)))
  const numCols = header.length
  const numRows = rows.length

  const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'))
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  const sheet0 = meta.data.sheets[0]
  const sheetId = sheet0.properties.sheetId
  const title = sheet0.properties.title

  // 1) Overwrite the values.
  await sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: title })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${title}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values },
  })

  // 2) Formatting, freeze, dropdowns, colour rules.
  const requests = []

  // Clear any prior conditional-format rules so re-runs don't stack them.
  const existingRules = sheet0.conditionalFormats || []
  for (let i = existingRules.length - 1; i >= 0; i--) {
    requests.push({ deleteConditionalFormatRule: { sheetId, index: i } })
  }

  // Header row: navy fill, white bold text.
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.118, green: 0.165, blue: 0.353 },
          textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)',
    },
  })

  // Freeze the header row.
  requests.push({
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
      fields: 'gridProperties.frozenRowCount',
    },
  })

  // Dropdowns.
  for (const d of DROPDOWNS) {
    requests.push({
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: numRows, startColumnIndex: d.col, endColumnIndex: d.col + 1 },
        rule: {
          condition: { type: 'ONE_OF_LIST', values: d.values.map((v) => ({ userEnteredValue: v })) },
          showCustomUi: true,
          strict: false,
        },
      },
    })
  }

  // Colour-coded status cells.
  for (const rule of COLOR_RULES) {
    requests.push({
      addConditionalFormatRule: {
        index: 0,
        rule: {
          ranges: [{ sheetId, startRowIndex: 1, endRowIndex: numRows, startColumnIndex: rule.col, endColumnIndex: rule.col + 1 }],
          booleanRule: {
            condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: rule.text }] },
            format: { backgroundColor: rule.color },
          },
        },
      },
    })
  }

  // Auto-size the metric columns; keep long text columns readable.
  requests.push({
    autoResizeDimensions: {
      dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: numCols },
    },
  })

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests },
  })

  console.log(`Synced ${numRows - 1} rows x ${numCols} cols into "${title}".`)
  console.log(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`)
}

main().catch((err) => {
  const msg = err?.errors?.[0]?.message || err?.message || String(err)
  console.error('SYNC FAILED:', msg)
  if (String(msg).includes('permission') || err?.code === 403) {
    console.error('\nFix: open the Sheet, click Share, and add this as an Editor:')
    console.error('  ballpark-sheets@ballpark-501915.iam.gserviceaccount.com')
  }
  process.exit(1)
})
