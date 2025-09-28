import { build } from 'bun';
import { readdir, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

console.log('🔨 Building ACE Paste Cleaner Pro...');

// Build the application
const result = await build({
  entrypoints: ['./src/main.tsx'],
  outdir: './dist',
  minify: true,
  splitting: true,
  target: 'browser',
  format: 'esm',
});

console.log('✅ Build completed successfully');

// Copy static assets
try {
  await mkdir('./dist', { recursive: true });
  
  // Copy HTML file and update script path
  const htmlContent = await import('fs').then(fs => fs.readFileSync('./index.html', 'utf8'));
  const updatedHtml = htmlContent
    .replace('/src/main.tsx', './main.js')
    .replace('</title>', '</title>\n    <link rel="stylesheet" href="./main.css">');
  await writeFile('./dist/index.html', updatedHtml);
  
  // Copy sanitizer profile
  const profileContent = await import('fs').then(fs => fs.readFileSync('./sanitizer-profile.json', 'utf8'));
  await writeFile('./dist/sanitizer-profile.json', profileContent);
  
  console.log('📁 Static assets copied');
} catch (error) {
  console.error('❌ Error copying static assets:', error);
}

console.log('🎉 Build process completed!');
