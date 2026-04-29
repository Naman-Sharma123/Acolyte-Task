const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function requestJson(url, { method = 'GET', body } = {}) {
  const res = await fetch(API_BASE + url, {
    method,
    headers: {
      'Content-Type': body ? 'application/json' : undefined,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
    method,
    headers: {
      'Content-Type': body ? 'application/json' : undefined,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText
    throw new Error(message)
  }
  return data
}

function buildUrl(path, query) {
  if (!query) return path
  const params = new URLSearchParams(query)
  const s = params.toString()
  return s ? `${path}?${s}` : path
}

export function apiGet(path, query) {
  return requestJson(buildUrl(path, query))
}

export function apiPost(path, body) {
  return requestJson(path, { method: 'POST', body })
}

export function apiPut(path, body) {
  return requestJson(path, { method: 'PUT', body })
}

export async function downloadFile(path, query) {
  const url = buildUrl(API_BASE + path, query)
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }

  const blob = await res.blob()
  const disposition = res.headers.get('content-disposition')
  const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] || 'export'

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
}

