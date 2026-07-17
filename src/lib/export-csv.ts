function escapeCsvCell(cell: string | number) {
  const str = String(cell)
  if (/["\n,]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const lines = [headers, ...rows].map((row) =>
    row.map(escapeCsvCell).join(','),
  )
  // Leading BOM so Excel opens UTF-8 (e.g. peso signs, en dashes) correctly.
  const csvContent = '﻿' + lines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
