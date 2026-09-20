/** Rasterize the checked-in app-icon artwork into the cross-platform master PNG. */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/** Pixel width and height of the cross-platform master icon. */
export const APP_ICON_CANVAS_SIZE = 1024

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const buildRoot = join(packageRoot, 'build')
const sourcePath = join(buildRoot, 'app-icon.svg')
const outputPath = join(buildRoot, 'app-icon.png')

/**
 * Derive the 1024px RGBA16 master from the checked-in vector artwork.
 *
 * `generate-mac-app-icon` and `generate-windows-app-icon` both read this master
 * and reject anything that is not a 1024x1024 RGBA16 PNG carrying an ICC profile.
 * @param source - absolute path to the square source SVG.
 * @param output - absolute path to write the master PNG to.
 */
export async function generateAppIconSource(source = sourcePath, output = outputPath) {
  if (resolve(source) === resolve(output)) {
    throw new Error('generate-app-icon-source: output must not overwrite the source artwork')
  }
  const artwork = await readFile(source)
  const rendered = await sharp(artwork, { density: 384 })
    .resize(APP_ICON_CANVAS_SIZE, APP_ICON_CANVAS_SIZE, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .toColourspace('rgb16')
    .withIccProfile('srgb')
    .png({ compressionLevel: 9 })
    .toBuffer()
  await writeFile(output, rendered)
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await generateAppIconSource()
}
