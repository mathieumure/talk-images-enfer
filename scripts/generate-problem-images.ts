#!/usr/bin/env tsx
import sharp from 'sharp';
import { mkdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const SOURCE_DIR = join(PROJECT_ROOT, 'packages/image-scraper/images/Character portraits');
const OUTPUT_DIR = join(PROJECT_ROOT, 'public/demo-images');

async function generateProblemImages(): Promise<void> {
  // Créer le dossier de sortie
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('🎨 Génération des images problématiques...\n');

  // 1. Image avec fond blanc au lieu de transparence (convertir PNG -> JPEG)
  console.log('📸 1. JPEG avec fond blanc (Athena)...');
  await sharp(join(SOURCE_DIR, 'Athena.png'))
    .flatten({ background: '#ffffff' }) // Remplace la transparence par du blanc
    .jpeg({ quality: 90 })
    .toFile(join(OUTPUT_DIR, 'athena-white-bg.jpg'));

  // 2. Image étirée (manque d'object-fit)
  console.log('📸 2. Image étirée (Achilles)...');
  await sharp(join(SOURCE_DIR, 'Achilles.png'))
    .resize(400, 400, {
      fit: 'fill', // Étire l'image sans respecter le ratio
      kernel: sharp.kernel.nearest
    })
    .toFile(join(OUTPUT_DIR, 'achilles-stretched.png'));

  // 3. Pas de problème visuel pour CLS - c'est une animation

  // 4. Image trop lourde (très haute résolution)
  console.log('📸 4. Image lourde non optimisée (Hermes)...');
  await sharp(join(SOURCE_DIR, 'Hermes.png'))
    .resize(4000, 4000, { fit: 'inside' }) // Grande taille
    .png({
      compressionLevel: 0, // Pas de compression
      quality: 100
    })
    .toFile(join(OUTPUT_DIR, 'hermes-heavy.png'));

  // 5. Image floue / mauvaise qualité
  console.log('📸 5. Image floue (Artemis)...');
  await sharp(join(SOURCE_DIR, 'Artemis.png'))
    .resize(50, 50) // Très petite résolution
    .resize(400, 400) // Re-agrandir pour voir les pixels
    .jpeg({ quality: 30 }) // Basse qualité
    .toFile(join(OUTPUT_DIR, 'artemis-blurry.jpg'));

  // 6. Image cassée - on va créer une image corrompue ou simplement ne pas créer le fichier
  console.log('📸 6. Image cassée - référence à un fichier inexistant (404.png)');
  // On ne crée pas le fichier, il restera en 404

  console.log('\n✨ Génération terminée !');
  console.log(`📁 Images générées dans: ${OUTPUT_DIR}`);

  // Afficher les tailles des fichiers
  console.log('\n📊 Tailles des fichiers générés:');

  const files = [
    'athena-white-bg.jpg',
    'achilles-stretched.png',
    'hermes-heavy.png',
    'artemis-blurry.jpg'
  ];

  for (const file of files) {
    try {
      const stats = await stat(join(OUTPUT_DIR, file));
      const sizeKB = (stats.size / 1024).toFixed(2);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  ${file}: ${sizeKB} KB ${sizeMB > 1 ? `(${sizeMB} MB)` : ''}`);
    } catch (error) {
      console.log(`  ${file}: non trouvé`);
    }
  }
}

// Exécuter la fonction
generateProblemImages().catch((error) => {
  console.error('❌ Erreur lors de la génération des images:', error);
  process.exit(1);
});