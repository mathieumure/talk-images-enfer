import { useState, useEffect, useMemo } from 'react';
import ControlButtons from './ControlButtons';
import CodeDisplay from './CodeDisplay';
import BrowserMockup from './BrowserMockup';
import '../../styles/srcset-demos.scss';

interface ImageData {
  filename: string;
  dpr: number;
  width: number;
  height: number;
  sizeKB: number;
}

interface SrcsetData {
  artDirection: {
    mobile: ImageData[];
    tablet: ImageData[];
    desktop: ImageData[];
  };
}

type SourceType = 'mobile' | 'tablet' | 'desktop';

// Picture element source selection (matches browser behavior)
function selectPictureSource(viewport: number): SourceType {
  // Media queries evaluated top-to-bottom
  // Desktop: min-width 1024px
  if (viewport >= 1024) return 'desktop';
  // Tablet: min-width 640px
  if (viewport >= 640) return 'tablet';
  // Mobile: fallback (img tag)
  return 'mobile';
}

// Get aspect ratio label
function getAspectLabel(sourceType: SourceType): string {
  switch (sourceType) {
    case 'mobile': return 'Portrait (Mobile)';
    case 'tablet': return 'Carré (Tablet)';
    case 'desktop': return 'Large (Desktop)';
    default: return '';
  }
}

// Get media query text
function getMediaQueryText(sourceType: SourceType): string {
  switch (sourceType) {
    case 'desktop': return '&lt;source media="(min-width: 1024px)"&gt;';
    case 'tablet': return '&lt;source media="(min-width: 640px)"&gt;';
    case 'mobile': return '&lt;img&gt; (fallback)';
    default: return '';
  }
}

// Density descriptor selection
function selectDensityImage(images: ImageData[], dpr: number): ImageData | null {
  if (!images || images.length === 0) return null;

  const sorted = [...images].sort((a, b) => a.dpr - b.dpr);
  const exact = sorted.find(img => img.dpr === dpr);
  if (exact) return exact;

  const higher = sorted.find(img => img.dpr > dpr);
  if (higher) return higher;

  return sorted[sorted.length - 1];
}

// Generate HTML code with file sizes
function generateCode(desktopImages: ImageData[], tabletImages: ImageData[], mobileImages: ImageData[]): string {
  if (!Array.isArray(desktopImages) || !Array.isArray(tabletImages) || !Array.isArray(mobileImages)) return '';

  const desktopLines = desktopImages
    .map(img => `      /srcset-demo/${img.filename} ${img.dpr}x,  <!-- ${img.sizeKB.toFixed(1)} KB -->`)
    .join('\n');

  const tabletLines = tabletImages
    .map(img => `      /srcset-demo/${img.filename} ${img.dpr}x,  <!-- ${img.sizeKB.toFixed(1)} KB -->`)
    .join('\n');

  const mobileLines = mobileImages
    .map(img => `      /srcset-demo/${img.filename} ${img.dpr}x,  <!-- ${img.sizeKB.toFixed(1)} KB -->`)
    .join('\n');

  return `<picture>
  <source
    media="(min-width: 1024px)"
    srcset="
${desktopLines}
    "
  />
  <source
    media="(min-width: 640px)"
    srcset="
${tabletLines}
    "
  />
  <img
    srcset="
${mobileLines}
    "
    src="/srcset-demo/megaera-mobile-1x.jpg"
    alt="Megaera"
  />
</picture>`;
}

const VIEWPORT_OPTIONS = [
  { value: 360, label: '360px' },
  { value: 720, label: '720px' },
  { value: 1024, label: '1024px' },
  { value: 1920, label: '1920px' },
];

const DPR_OPTIONS = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
];

export default function ArtDirectionDemo() {
  const [srcsetData, setSrcsetData] = useState<SrcsetData | null>(null);
  const [currentViewport, setCurrentViewport] = useState(1024);
  const [currentDpr, setCurrentDpr] = useState(2);

  // Load srcset data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/srcset-demo/srcset-data.json');
        const data = await response.json();
        setSrcsetData(data);
      } catch (error) {
        console.error('Error loading srcset data:', error);
      }
    }
    loadData();
  }, []);

  // Determine which source to use
  const sourceType = useMemo(() => selectPictureSource(currentViewport), [currentViewport]);

  // Select image based on DPR (but cap at 2x since we only have 1x and 2x for art direction)
  const selectedImage = useMemo(() => {
    if (!srcsetData) return null;
    const sourceImages = srcsetData.artDirection[sourceType];
    const effectiveDpr = Math.min(currentDpr, 2);
    return selectDensityImage(sourceImages, effectiveDpr);
  }, [srcsetData, sourceType, currentDpr]);

  const code = useMemo(() => {
    if (!srcsetData || !srcsetData.artDirection) return '';
    return generateCode(
      srcsetData.artDirection.desktop,
      srcsetData.artDirection.tablet,
      srcsetData.artDirection.mobile
    );
  }, [srcsetData]);

  if (!srcsetData || !selectedImage || !code) {
    return <div className="srcset-demo-container">Loading...</div>;
  }

  return (
    <div className="srcset-demo-container">
      <div className="srcset-demo-grid">
        {/* Browser Mockup */}
        <BrowserMockup>
          <div className="srcset-image-container">
            <img src={`/srcset-demo/${selectedImage.filename}`} alt="Megaera" />
            <div className="srcset-aspect-label">{getAspectLabel(sourceType)}</div>
          </div>
          <div className="srcset-metrics-compact">
            <div className="srcset-metric-row">
              <span className="srcset-metric-label">Source:</span>
              <span className="srcset-metric-value" dangerouslySetInnerHTML={{ __html: getMediaQueryText(sourceType) }} />
            </div>
            <div className="srcset-metric-row">
              <span className="srcset-metric-label">Image:</span>
              <span className="srcset-metric-value">{selectedImage.filename}</span>
            </div>
            <div className="srcset-metric-row">
              <span className="srcset-metric-label">Résolution:</span>
              <span className="srcset-metric-value">{selectedImage.width}x{selectedImage.height}</span>
            </div>
          </div>
        </BrowserMockup>

        {/* Code Panel */}
        <CodeDisplay code={code} selectedFilename={selectedImage.filename} activeSourceType={sourceType} />
      </div>

      {/* Controls */}
      <div className="srcset-controls">
        <ControlButtons
          label="Viewport Width"
          options={VIEWPORT_OPTIONS}
          currentValue={currentViewport}
          onChange={setCurrentViewport}
        />
        <ControlButtons
          label="Pixel Density (DPR)"
          options={DPR_OPTIONS}
          currentValue={currentDpr}
          onChange={setCurrentDpr}
        />
      </div>
    </div>
  );
}
