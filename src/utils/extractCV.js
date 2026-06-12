import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = () => reject(new Error('Lecture impossible'))
      reader.readAsText(file, 'UTF-8')
    })
  }

  if (ext === 'pdf') {
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map(it => it.str).join(' ')
      text += pageText + '\n'
    }
    return text.trim()
  }

  if (ext === 'docx') {
    const { extractRawText } = await import('mammoth')
    const buffer = await file.arrayBuffer()
    const result = await extractRawText({ arrayBuffer: buffer })
    return result.value.trim()
  }

  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('fra+eng')
    const { data: { text } } = await worker.recognize(file)
    await worker.terminate()
    return text.trim()
  }

  throw new Error(`Format non supporté : .${ext}. Utilisez PDF, DOCX, PNG, JPG ou TXT.`)
}
