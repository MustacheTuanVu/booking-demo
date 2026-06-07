const FALLBACK_IMAGE = '/images/logo_queen.png'

export function getMediaUrl(
  value?: string | null,
  fallback = FALLBACK_IMAGE,
): string {
  const source = value?.trim()
  if (!source) return fallback

  if (
    source.startsWith('http://') ||
    source.startsWith('https://') ||
    source.startsWith('data:') ||
    source.startsWith('blob:')
  ) {
    return source
  }

  if (
    source.startsWith('/images/') ||
    source.startsWith('/icon') ||
    source.startsWith('/web-app-manifest')
  ) {
    return source
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')
  if (!apiUrl) return fallback

  const normalizedPath = source.startsWith('./')
    ? source.slice(1)
    : source.startsWith('/')
      ? source
      : `/${source}`

  return `${apiUrl}${normalizedPath}`
}
