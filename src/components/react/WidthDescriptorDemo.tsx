import { useState, useEffect, useMemo } from 'react';
import ControlButtons from './ControlButtons';
import CodeDisplay from './CodeDisplay';
import BrowserMockup from './BrowserMockup';
import '../../styles/srcset-demos.scss';

interface ImageData {
  filename: string;
  width: number;
  sizeKB: number;
}

interface SrcsetData {
  widthDescriptors: ImageData[];
}

// Width descriptor selection algorithm
function selectWidthImage(images: ImageData[], viewport: number, dpr: number, sizesPercent: number): ImageData | null {
  if (!images || images.length === 0) return null;

  // Calculate physical width needed
  const cssWidth = (viewport * sizesPercent) / 100;
  const physicalWidth = cssWidth * dpr;

  // Sort images by width
  const sorted = [...images].sort((a, b) => a.width - b.width);

  // Browser selects smallest image >= physicalWidth
  const selected = sorted.find(img => img.width >= physicalWidth);
  return selected || sorted[sorted.length - 1];
}

// Generate HTML code with dynamic sizes value and file sizes
function generateCode(images: ImageData[], sizesPercent: number): string {
  if (!Array.isArray(images)) return '';

  const srcsetLines = images
    .map(img => `    /srcset-demo/${img.filename} ${img.width}w,  <!-- ${img.sizeKB.toFixed(1)} KB -->`)
    .join('\n');

  return `<img
  srcset="
${srcsetLines}
  "
  sizes="${sizesPercent}vw"
  src="/srcset-demo/achilles-640w.jpg"
  alt="Achilles"
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

export default function WidthDescriptorDemo() {
  const [srcsetData, setSrcsetData] = useState<SrcsetData | null>(null);
  const [currentViewport, setCurrentViewport] = useState(1024);
  const [currentDpr, setCurrentDpr] = useState(2);
  const [currentWidthPercent, setCurrentWidthPercent] = useState(50);

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

  // Select image based on current settings
  const selectedImage = useMemo(() => {
    if (!srcsetData) return null;
    return selectWidthImage(srcsetData.widthDescriptors, currentViewport, currentDpr, currentWidthPercent);
  }, [srcsetData, currentViewport, currentDpr, currentWidthPercent]);

  // Calculate values for display
  const calculations = useMemo(() => {
    const cssWidth = (currentViewport * currentWidthPercent) / 100;
    const physicalWidth = cssWidth * currentDpr;
    return {
      cssWidth: Math.round(cssWidth),
      physicalWidth: Math.round(physicalWidth),
    };
  }, [currentViewport, currentDpr, currentWidthPercent]);

  const code = useMemo(() => {
    if (!srcsetData || !srcsetData.widthDescriptors) return '';
    return generateCode(srcsetData.widthDescriptors, currentWidthPercent);
  }, [srcsetData, currentWidthPercent]);

  if (!srcsetData || !selectedImage || !code) {
    return <div className="srcset-demo-container">Loading...</div>;
  }

  return (
    <div className="srcset-demo-container">
      <div className="srcset-demo-grid">
        {/* Browser Mockup */}
        <BrowserMockup
          imageSrc={`/srcset-demo/${selectedImage.filename}`}
          imageAlt="Achilles"
        >
          <div className="srcset-calculation">
            <div className="srcset-calc-title">Calcul de sélection:</div>
            <div className="srcset-calc-steps">
              <div className="srcset-calc-step">
                <span className="srcset-calc-label">Viewport:</span>
                <span className="srcset-calc-value">{currentViewport}px</span>
              </div>
              <div className="srcset-calc-step">
                <span className="srcset-calc-label">sizes:</span>
                <span className="srcset-calc-value">{currentWidthPercent}vw</span>
              </div>
              <div className="srcset-calc-step">
                <span className="srcset-calc-label">Largeur CSS:</span>
                <span className="srcset-calc-value">{calculations.cssWidth}px ({currentViewport} × {currentWidthPercent}%)</span>
              </div>
              <div className="srcset-calc-step">
                <span className="srcset-calc-label">DPR:</span>
                <span className="srcset-calc-value">{currentDpr}x</span>
              </div>
              <div className="srcset-calc-step srcset-highlight">
                <span className="srcset-calc-label">→ Largeur physique:</span>
                <span className="srcset-calc-value">{calculations.physicalWidth}px ({calculations.cssWidth} × {currentDpr})</span>
              </div>
              <div className="srcset-calc-step srcset-highlight">
                <span className="srcset-calc-label">→ Sélectionné:</span>
                <span className="srcset-calc-value">{selectedImage.filename}</span>
              </div>
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
        <div className="srcset-control-group srcset-slider-group">
          <label>
            Largeur CSS (pour sizes)
            <span className="srcset-slider-value">{currentWidthPercent}%</span>
          </label>
          <input
            type="range"
            min="20"
            max="100"
            value={currentWidthPercent}
            step="5"
            onChange={(e) => setCurrentWidthPercent(parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}