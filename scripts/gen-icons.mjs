// Generates Electron icon assets from the source SVGs. Colored, Windows/Linux.
//   docs/mocks/icons/v1.svg       -> app icon (window, taskbar, installer)
//   docs/mocks/icons/v1-tray.svg  -> simplified small-size glyph for the tray
// Run: npm run gen:icons
import { Resvg } from '@resvg/resvg-js'
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync } from 'node:fs'

const render = (svg, size) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()

const full = readFileSync('docs/mocks/icons/v1.svg', 'utf8')
const tray = readFileSync('docs/mocks/icons/v1-tray.svg', 'utf8')

// App icon: single 512 PNG (used at runtime + as electron-builder source).
const appPng = render(full, 512)
writeFileSync('resources/icon.png', appPng)
writeFileSync('build/icon.png', appPng)

// Windows app/installer icon: multi-size .ico from the full art.
writeFileSync('build/icon.ico', await pngToIco([16, 24, 32, 48, 64, 128, 256].map((s) => render(full, s))))

// Tray icon: multi-size .ico from the simplified art so it stays legible at 16px.
writeFileSync('resources/tray.ico', await pngToIco([16, 24, 32, 48].map((s) => render(tray, s))))

console.log('icons: resources/icon.png, resources/tray.ico, build/icon.png, build/icon.ico')
