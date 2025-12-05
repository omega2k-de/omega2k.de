#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const TARGET_DIR = path.resolve('./apps/www/public/cdn');
const maxWidth = Number(process.argv[2] ?? 1200);

if (!maxWidth || maxWidth < 1) {
  console.error('Usage: node tools/resize-and-webp.mjs <maxWidth>');
  process.exit(1);
}

async function collectFilesRecursive(dir) {
  const result = [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectFilesRecursive(fullPath);
      result.push(...nested);
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }

  return result;
}

async function resizeOriginals(allFiles) {
  const originals = allFiles.filter(fullPath => {
    const file = path.basename(fullPath);
    return /\.(jpe?g|png)$/i.test(file) && !/_\d+x\d+\.(jpe?g|png)$/i.test(file);
  });

  console.log(`Found ${originals.length} base JPEG(s) to check for resizing.`);

  for (const filePath of originals) {
    const file = path.basename(filePath);
    const dir = path.dirname(filePath);

    const img = sharp(filePath);
    const meta = await img.metadata();

    if (!meta.width || !meta.height) {
      console.warn(`Skipping ${file} – cannot read dimensions.`);
      continue;
    }

    if (meta.width <= maxWidth) {
      console.log(`Skipping ${file} – already <= ${maxWidth}px wide.`);
      continue;
    }

    const newWidth = maxWidth;
    const newHeight = Math.round((meta.height / meta.width) * newWidth);

    const ext = path.extname(file);
    const base = file.slice(0, -ext.length);
    const outName = `${base}_${newWidth}x${newHeight}.webp`;
    const outPath = path.join(dir, outName);

    await img
      .resize({ width: newWidth, height: newHeight })
      .toFormat('webp', { quality: 85 })
      .toFile(outPath);

    console.log(`Created resized JPEG: ${path.relative(TARGET_DIR, outPath)}`);
  }
}

async function convertAllToWebp(allFiles) {
  const jpegs = allFiles.filter(fullPath => /\.(jpe?g)$/i.test(fullPath));

  console.log(`Converting ${jpegs.length} JPEG(s) to WebP (if not existing).`);

  for (const filePath of jpegs) {
    const file = path.basename(filePath);
    const dir = path.dirname(filePath);
    const base = file.replace(/\.(jpe?g)$/i, '');
    const webpName = `${base}.webp`;
    const webpPath = path.join(dir, webpName);

    try {
      await fs.promises.access(webpPath, fs.constants.F_OK);
      console.log(`Skipping ${path.relative(TARGET_DIR, webpPath)} – already exists.`);
      continue;
    } catch {
      // noop
    }

    await sharp(filePath).toFormat('webp', { quality: 85 }).toFile(webpPath);

    console.log(`Created WebP: ${path.relative(TARGET_DIR, webpPath)}`);
  }
}

async function run() {
  console.log(`Target directory: ${TARGET_DIR}`);
  console.log(`Max width: ${maxWidth}px`);

  const allFiles = await collectFilesRecursive(TARGET_DIR);

  await resizeOriginals(allFiles);
  await convertAllToWebp(allFiles);

  console.log('Done.');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
