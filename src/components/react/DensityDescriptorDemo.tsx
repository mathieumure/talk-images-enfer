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
  densityDescriptors: ImageData[];
}

// Density descriptor selection algorithm (matches browser behavior)
function selectDensityImage(images: ImageData[], dpr: number): ImageData | null {
  if (!images || images.length === 0) return null;

  const sorted = [...images].sort((a, b) => a.dpr - b.dpr);

  // Find exact match first
  const exact = sorted.find(img => img.dpr === dpr);
  if (exact) return exact;

  // Find next higher DPR
  const higher = sorted.find(img => img.dpr > dpr);
  if (higher) return higher;

  // Return highest available
  return sorted[sorted.length - 1];
}

// Generate HTML code with file sizes
function generateCode(images: ImageData[]): string {
  if (!Array.isArray(images)) return '';

  const srcsetLines = images
    .map(img => `    /srcset-demo/${img.filename} ${img.dpr}x,  <!-- ${img.sizeKB.toFixed(1)} KB -->`)
    .join('\n');

  return `<img
  srcset="
${srcsetLines}
  "
  src="/srcset-demo/thanatos-1x.jpg"
  alt="Thanatos"
  width="400"
  height="225"
/>`;
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

export default function DensityDescriptorDemo() {
  const [srcsetData, setSrcsetData] = useState<SrcsetData | null>(null);
  const [currentViewport, setCurrentViewport] = useState(1024);
  const [currentDpr, setCurrentDpr] = useState(2);

  // Load srcset data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}srcset-demo/srcset-data.json`);
        const data = await response.json();
        setSrcsetData(data);
      } catch (error) {
        console.error('Error loading srcset data:', error);
      }
    }
    loadData();
  }, []);

  // Select image based on current DPR
  const selectedImage = useMemo(() => {
    if (!srcsetData) return null;
    return selectDensityImage(srcsetData.densityDescriptors, currentDpr);
  }, [srcsetData, currentDpr]);

  const code = useMemo(() => {
    if (!srcsetData || !srcsetData.densityDescriptors) return '';
    return generateCode(srcsetData.densityDescriptors);
  }, [srcsetData]);

  if (!srcsetData || !selectedImage || !code) {
    return <div className="srcset-demo-container">Loading...</div>;
  }

  return (
    <div className="srcset-demo-container">
      <div className="srcset-demo-grid">
        {/* Browser Mockup */}
        <BrowserMockup
          imageSrc={`${import.meta.env.BASE_URL}srcset-demo/${selectedImage.filename}`}
          imageAlt="Thanatos"
        >
          <div className="srcset-metrics">
            <div className="srcset-metric-item">
              <span className="srcset-metric-label">Viewport</span>
              <span className="srcset-metric-value">{currentViewport}px</span>
            </div>
            <div className="srcset-metric-item">
              <span className="srcset-metric-label">DPR</span>
              <span className="srcset-metric-value">{currentDpr}x</span>
            </div>
            <div className="srcset-metric-item">
              <span className="srcset-metric-label">Image chargée</span>
              <span className="srcset-metric-value">{selectedImage.filename}</span>
            </div>
            <div className="srcset-metric-item">
              <span className="srcset-metric-label">Résolution</span>
              <span className="srcset-metric-value">{selectedImage.width}x{selectedImage.height}</span>
            </div>
          </div>
        </BrowserMockup>

        {/* Code Panel */}
        <CodeDisplay code={code} selectedFilename={selectedImage.filename} />
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