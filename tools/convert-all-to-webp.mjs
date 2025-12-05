#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

console.log(`Scanning recursively from: ${ROOT_DIR}`);

async function collectFilesRecursive(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const childFiles = await collectFilesRecursive(full);
      files.push(...childFiles);
    } else {
      files.push(full);
    }
  }

  return files;
}

async function convertToWebp(files) {
  const imageFiles = files.filter(f => /\.(png|jpe?g)$/i.test(f));

  console.log(`Found ${imageFiles.length} image(s) to check.`);

  for (const file of imageFiles) {
    const ext = path.extname(file);
    const base = file.slice(0, -ext.length);

    const webpFile = `${base}.webp`;

    try {
      await fs.promises.access(webpFile, fs.constants.F_OK);
      console.log(`Skipping existing WebP: ${webpFile}`);
      continue;
    } catch {
      // file does not exist → convert
    }

    try {
      await sharp(file).toFormat('webp', { quality: 90 }).toFile(webpFile);

      console.log(`Created WebP: ${webpFile}`);
    } catch (err) {
      console.error(`Failed to convert ${file}`, err);
    }
  }
}

async function run() {
  const all = await collectFilesRecursive(ROOT_DIR);
  await convertToWebp(all);
  console.log('Done.');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
