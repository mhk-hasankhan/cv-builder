export function printCVFromRef(previewRef, title) {
  const printWin = window.open('', '_blank')
  const previewHtml = previewRef.current?.innerHTML || ''
  printWin.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Outfit:wght@400;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        @page { margin: 0; size: A4; }
      </style>
    </head>
    <body>${previewHtml}</body>
    </html>
  `)
  printWin.document.close()
  printWin.focus()
  setTimeout(() => { printWin.print(); printWin.close() }, 500)
}
