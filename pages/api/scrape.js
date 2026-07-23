export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  const { url } = req.body ?? {}

  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'URL invalide. Utilisez une URL commençant par http:// ou https://' })
  }

  /* Block private/local IPs */
  try {
    const host = new URL(url).hostname
    if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
      return res.status(403).json({ error: 'URL locale non autorisée' })
    }
  } catch {
    return res.status(400).json({ error: 'URL invalide' })
  }

  let html
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    })
    if (!response.ok) {
      return res.status(502).json({
        error: `La page a retourné une erreur HTTP ${response.status}. Elle est peut-être protégée (LinkedIn, etc.)`,
      })
    }
    html = await response.text()
  } catch (e) {
    return res.status(502).json({ error: `Impossible de charger cette page : ${e.message}` })
  }

  /* Extract readable text from HTML (same logic as scrape.php) */
  let text = html
  text = text.replace(/<(script|style|noscript|nav|header|footer|aside|iframe|svg|figure)[^>]*>[\s\S]*?<\/\1>/gi, '')
  text = text.replace(/<br\s*\/?>/gi,    '\n')
  text = text.replace(/<\/p>/gi,         '\n\n')
  text = text.replace(/<\/h[1-6]>/gi,    '\n\n')
  text = text.replace(/<\/li>/gi,        '\n')
  text = text.replace(/<\/div>/gi,       '\n')
  text = text.replace(/<\/section>/gi,   '\n\n')
  text = text.replace(/<[^>]+>/g,        '')
  text = text
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;/g, ' ')
  text = text.replace(/[ \t]+/g, ' ')

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const seen  = new Set()
  const clean = []
  for (const l of lines) {
    if (l.length < 3) continue
    const key = l.toLowerCase().replace(/\s+/g, '')
    if (seen.has(key)) continue
    seen.add(key)
    clean.push(l)
  }
  text = clean.join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 8000)

  if (text.length < 100) {
    return res.status(422).json({
      error: 'Texte trop court extrait — cette page est peut-être dynamique (JS requis) ou protégée.',
    })
  }

  return res.json({ text })
}
