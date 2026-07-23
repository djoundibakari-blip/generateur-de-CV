import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { generateCVHtml } from '../../lib/cvTemplate.js'

export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
  maxDuration: 30,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  const cv = req.body ?? {}

  let html
  try {
    html = generateCVHtml(cv)
  } catch (e) {
    return res.status(500).json({ error: 'Erreur génération HTML : ' + e.message })
  }

  let browser
  try {
    const isLocal = process.env.NODE_ENV === 'development'

    browser = await puppeteer.launch({
      args: isLocal ? ['--no-sandbox', '--disable-setuid-sandbox'] : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isLocal
        ? (process.platform === 'win32'
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : process.platform === 'darwin'
              ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
              : '/usr/bin/google-chrome')
        : await chromium.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    const nom = cv.personal?.nom || 'cv'
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="cv-${nom}.pdf"`)
    res.send(Buffer.from(pdf))
  } catch (e) {
    res.status(500).json({ error: 'Erreur génération PDF : ' + e.message })
  } finally {
    if (browser) await browser.close()
  }
}
