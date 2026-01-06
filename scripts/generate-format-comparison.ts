#!/usr/bin/env tsx
import sharp from 'sharp';
import { mkdir, stat, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const SOURCE_IMAGE = join(PROJECT_ROOT, 'packages/image-scraper/images/Character models/Model_Sheet_Achilles.jpg');
const OUTPUT_DIR = join(PROJECT_ROOT, 'public/image-format-comparison');

interface CompressionData {
  quality: number;
  sizeBytes: number;
  sizeKB: number;
  filename: string;
}

interface FormatCompressionData {
  jpeg: CompressionData[];
  webp: CompressionData[];
  avif: CompressionData[];
}

async function generateFormatComparison(): Promise<void> {
  // Créer le dossier de sortie
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('⚡ Génération des images dans 3 formats (JPEG, WebP, AVIF)...\n');
  console.log(`📸 Image source: Model_Sheet_Achilles.jpg\n`);

  const compressionLevels: number[] = [];
  // Générer les niveaux de 5 à 100 par pas de 5
  for (let quality = 5; quality <= 100; quality += 5) {
    compressionLevels.push(quality);
  }

  const results: FormatCompressionData = {
    jpeg: [],
    webp: [],
    avif: []
  };

  // Générer les images pour chaque format
  for (const format of ['jpeg', 'webp', 'avif'] as const) {
    console.log(`\n📦 Format: ${format.toUpperCase()}`);
    console.log('─'.repeat(50));

    for (const quality of compressionLevels) {
      const extension = format === 'jpeg' ? 'jpg' : format;
      const filename = `achilles-q${quality}.${extension}`;
      const outputPath = join(OUTPUT_DIR, filename);

      console.log(`🔄 Génération: ${filename} (qualité: ${quality})...`);

      // Créer le pipeline de base avec resize
      const pipeline = sharp(SOURCE_IMAGE)
        .resize(1000, null, {
          fit: 'inside',
          withoutEnlargement: true
        });

      // Appliquer le format approprié
      if (format === 'jpeg') {
        await pipeline.jpeg({ quality }).toFile(outputPath);
      } else if (format === 'webp') {
        await pipeline.webp({ quality }).toFile(outputPath);
      } else if (format === 'avif') {
        await pipeline.avif({ quality, effort: 6 }).toFile(outputPath);
      }

      // Obtenir la taille du fichier
      const stats = await stat(outputPath);
      const sizeKB = stats.size / 1024;

      results[format].push({
        quality: quality,
        sizeBytes: stats.size,
        sizeKB: Math.round(sizeKB * 100) / 100,
        filename: filename
      });

      console.log(`   ✓ ${sizeKB.toFixed(2)} KB`);
    }
  }

  // Sauvegarder les données dans un fichier JSON
  const dataPath = join(OUTPUT_DIR, 'compression-data.json');
  await writeFile(dataPath, JSON.stringify(results, null, 2));

  console.log('\n✨ Génération terminée !');
  console.log(`📁 Images générées dans: ${OUTPUT_DIR}`);
  console.log(`📊 Données sauvegardées dans: compression-data.json`);

  // Afficher un résumé pour chaque format
  console.log('\n📊 Résumé par format:');
  for (const format of ['jpeg', 'webp', 'avif'] as const) {
    const data = results[format];
    console.log(`\n${format.toUpperCase()}:`);
    console.log(`   Nombre d'images: ${data.length}`);
    console.log(`   Taille minimale: ${data[0].sizeKB} KB (qualité ${data[0].quality})`);
    console.log(`   Taille maximale: ${data[data.length - 1].sizeKB} KB (qualité ${data[data.length - 1].quality})`);
    console.log(`   Réduction: ${((1 - data[0].sizeKB / data[data.length - 1].sizeKB) * 100).toFixed(1)}%`);
  }
}

// Exécuter la fonction
generateFormatComparison().catch((error) => {
  console.error('❌ Erreur lors de la génération des images:', error);
  process.exit(1);
});
