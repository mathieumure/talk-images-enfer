#!/usr/bin/env tsx
import sharp from 'sharp';
import { mkdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const SOURCE_DIR = join(PROJECT_ROOT, 'packages/image-scraper/images/Character models');
const OUTPUT_DIR = join(PROJECT_ROOT, 'public/srcset-demo');

interface ImageData {
  descriptor: string;
  filename: string;
  width: number;
  height: number;
  sizeKB: number;
  dpr?: number;
}

interface SrcsetData {
  densityDescriptors: ImageData[];
  widthDescriptors: ImageData[];
  artDirection: {
    mobile: ImageData[];
    tablet: ImageData[];
    desktop: ImageData[];
  };
}

async function generateSrcsetDemo(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('⚡ Génération des images pour la démo srcset/sizes...\n');

  const results: SrcsetData = {
    densityDescriptors: [],
    widthDescriptors: [],
    artDirection: {
      mobile: [],
      tablet: [],
      desktop: []
    }
  };

  // ==============================================
  // SLIDE 1: Density Descriptors (1x, 2x, 3x)
  // ==============================================
  console.log('📦 Slide 1: Descripteurs de densité (1x, 2x, 3x)');
  console.log('─'.repeat(50));

  const SOURCE_THANATOS = join(SOURCE_DIR, 'Model_Sheet_Thanatos.jpg');
  const densityConfigs = [
    { dpr: 1, width: 400, filename: 'thanatos-1x.jpg' },
    { dpr: 2, width: 800, filename: 'thanatos-2x.jpg' },
    { dpr: 3, width: 1200, filename: 'thanatos-3x.jpg' }
  ];

  for (const config of densityConfigs) {
    const outputPath = join(OUTPUT_DIR, config.filename);
    console.log(`🔄 Génération: ${config.filename} (${config.width}px)...`);

    const info = await sharp(SOURCE_THANATOS)
      .resize(config.width, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    const stats = await stat(outputPath);
    const sizeKB = Math.round((stats.size / 1024) * 100) / 100;

    results.densityDescriptors.push({
      descriptor: `${config.dpr}x`,
      filename: config.filename,
      width: info.width,
      height: info.height,
      sizeKB,
      dpr: config.dpr
    });

    console.log(`   ✓ ${sizeKB} KB (${info.width}x${info.height})`);
  }

  // ==============================================
  // SLIDE 2: Width Descriptors (w) + sizes
  // ==============================================
  console.log('\n📦 Slide 2: Descripteurs de largeur (w) + sizes');
  console.log('─'.repeat(50));

  const SOURCE_ACHILLES = join(SOURCE_DIR, 'Model_Sheet_Achilles.jpg');
  const widthConfigs = [320, 640, 960, 1280, 1920];

  for (const width of widthConfigs) {
    const filename = `achilles-${width}w.jpg`;
    const outputPath = join(OUTPUT_DIR, filename);
    console.log(`🔄 Génération: ${filename} (${width}px)...`);

    const info = await sharp(SOURCE_ACHILLES)
      .resize(width, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    const stats = await stat(outputPath);
    const sizeKB = Math.round((stats.size / 1024) * 100) / 100;

    results.widthDescriptors.push({
      descriptor: `${width}w`,
      filename,
      width: info.width,
      height: info.height,
      sizeKB
    });

    console.log(`   ✓ ${sizeKB} KB (${info.width}x${info.height})`);
  }

  // ==============================================
  // SLIDE 3: Art Direction avec <picture>
  // ==============================================
  console.log('\n📦 Slide 3: Art direction avec <picture>');
  console.log('─'.repeat(50));

  const SOURCE_MEGAERA = join(SOURCE_DIR, 'Model_Sheet_Megaera.jpg');

  // Mobile: Portrait crop (320x480) - focus on top
  const mobileConfigs = [
    { dpr: 1, width: 320, height: 480, filename: 'megaera-mobile-1x.jpg' },
    { dpr: 2, width: 640, height: 960, filename: 'megaera-mobile-2x.jpg' }
  ];

  console.log('\n  📱 Mobile (portrait crop):');
  for (const config of mobileConfigs) {
    const outputPath = join(OUTPUT_DIR, config.filename);
    console.log(`  🔄 ${config.filename} (${config.width}x${config.height})...`);

    const info = await sharp(SOURCE_MEGAERA)
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'top'
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    const stats = await stat(outputPath);
    const sizeKB = Math.round((stats.size / 1024) * 100) / 100;

    results.artDirection.mobile.push({
      descriptor: `${config.dpr}x`,
      filename: config.filename,
      width: info.width,
      height: info.height,
      sizeKB,
      dpr: config.dpr
    });

    console.log(`     ✓ ${sizeKB} KB`);
  }

  // Tablet: Square crop (768x768) - center focus
  const tabletConfigs = [
    { dpr: 1, width: 768, height: 768, filename: 'megaera-tablet-1x.jpg' },
    { dpr: 2, width: 1536, height: 1536, filename: 'megaera-tablet-2x.jpg' }
  ];

  console.log('\n  📱 Tablet (square crop):');
  for (const config of tabletConfigs) {
    const outputPath = join(OUTPUT_DIR, config.filename);
    console.log(`  🔄 ${config.filename} (${config.width}x${config.height})...`);

    const info = await sharp(SOURCE_MEGAERA)
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    const stats = await stat(outputPath);
    const sizeKB = Math.round((stats.size / 1024) * 100) / 100;

    results.artDirection.tablet.push({
      descriptor: `${config.dpr}x`,
      filename: config.filename,
      width: info.width,
      height: info.height,
      sizeKB,
      dpr: config.dpr
    });

    console.log(`     ✓ ${sizeKB} KB`);
  }

  // Desktop: Wide crop (1200x600) - center focus
  const desktopConfigs = [
    { dpr: 1, width: 1200, height: 600, filename: 'megaera-desktop-1x.jpg' },
    { dpr: 2, width: 2400, height: 1200, filename: 'megaera-desktop-2x.jpg' }
  ];

  console.log('\n  🖥️  Desktop (wide crop):');
  for (const config of desktopConfigs) {
    const outputPath = join(OUTPUT_DIR, config.filename);
    console.log(`  🔄 ${config.filename} (${config.width}x${config.height})...`);

    const info = await sharp(SOURCE_MEGAERA)
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    const stats = await stat(outputPath);
    const sizeKB = Math.round((stats.size / 1024) * 100) / 100;

    results.artDirection.desktop.push({
      descriptor: `${config.dpr}x`,
      filename: config.filename,
      width: info.width,
      height: info.height,
      sizeKB,
      dpr: config.dpr
    });

    console.log(`     ✓ ${sizeKB} KB`);
  }

  // Save metadata JSON
  const dataPath = join(OUTPUT_DIR, 'srcset-data.json');
  await writeFile(dataPath, JSON.stringify(results, null, 2));

  console.log('\n✨ Génération terminée !');
  console.log(`📁 Images générées dans: ${OUTPUT_DIR}`);
  console.log(`📊 Données sauvegardées dans: srcset-data.json`);

  // Summary
  const totalImages = results.densityDescriptors.length +
                      results.widthDescriptors.length +
                      results.artDirection.mobile.length +
                      results.artDirection.tablet.length +
                      results.artDirection.desktop.length;

  console.log(`\n📊 Résumé:`);
  console.log(`   Total d'images générées: ${totalImages}`);
  console.log(`   - Descripteurs de densité: ${results.densityDescriptors.length}`);
  console.log(`   - Descripteurs de largeur: ${results.widthDescriptors.length}`);
  console.log(`   - Art direction mobile: ${results.artDirection.mobile.length}`);
  console.log(`   - Art direction tablet: ${results.artDirection.tablet.length}`);
  console.log(`   - Art direction desktop: ${results.artDirection.desktop.length}`);
}

// Execute
generateSrcsetDemo().catch((error) => {
  console.error('❌ Erreur lors de la génération des images:', error);
  process.exit(1);
});
