import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import '../../styles/format-comparison.scss';

Chart.register(...registerables);

interface ImageData {
  filename: string;
  quality: number;
  sizeKB: number;
}

interface CompressionData {
  jpeg: ImageData[];
  webp: ImageData[];
  avif: ImageData[];
}

type Format = 'jpeg' | 'webp' | 'avif';

interface FormatComparisonProps {
  format: Format;
  title: string;
}

// Format configuration
const FORMAT_CONFIG = {
  jpeg: {
    color: '#FF6B6B',
    extension: 'jpg'
  },
  webp: {
    color: '#4ECDC4',
    extension: 'webp'
  },
  avif: {
    color: '#45B7D1',
    extension: 'avif'
  }
};

export default function FormatComparison({ format, title }: FormatComparisonProps) {
  const [compressionData, setCompressionData] = useState<CompressionData | null>(null);
  const [sliderValue, setSliderValue] = useState(14);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Load compression data
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}image-format-comparison/compression-data.json`);
        const data = await response.json();
        setCompressionData(data);
      } catch (error) {
        console.error('Error loading compression data:', error);
      }
    }
    loadData();
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!compressionData || !chartRef.current) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const datasets = [];

    // Always add JPEG as reference for webp and avif
    if (format === 'webp' || format === 'avif') {
      datasets.push({
        label: 'JPEG',
        data: compressionData.jpeg.map(d => d.sizeKB),
        borderColor: FORMAT_CONFIG.jpeg.color,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 8,
        pointBackgroundColor: FORMAT_CONFIG.jpeg.color,
        tension: 0.3,
        borderDash: [5, 5]
      });
    }

    // Add WebP as reference for avif
    if (format === 'avif') {
      datasets.push({
        label: 'WebP',
        data: compressionData.webp.map(d => d.sizeKB),
        borderColor: FORMAT_CONFIG.webp.color,
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 8,
        pointBackgroundColor: FORMAT_CONFIG.webp.color,
        tension: 0.3,
        borderDash: [5, 5]
      });
    }

    // Add current format (always solid line, thicker)
    datasets.push({
      label: format.toUpperCase(),
      data: compressionData[format].map(d => d.sizeKB),
      borderColor: FORMAT_CONFIG[format].color,
      backgroundColor: `${FORMAT_CONFIG[format].color}1A`, // Add alpha
      borderWidth: 3,
      pointRadius: 3,
      pointHoverRadius: 8,
      pointBackgroundColor: FORMAT_CONFIG[format].color,
      tension: 0.3,
    });

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: compressionData[format].map(d => d.quality.toString()),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 14, weight: 'bold' },
              color: '#333',
              usePointStyle: true,
              padding: 15
            }
          },
          title: {
            display: true,
            text: 'Comparaison des formats : Qualité vs Taille',
            font: { size: 18, weight: 'bold' },
            color: '#333'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Niveau de compression (%)',
              font: { size: 14, weight: 'bold' },
              color: '#666'
            },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          },
          y: {
            title: {
              display: true,
              text: 'Poids (KB)',
              font: { size: 14, weight: 'bold' },
              color: '#666'
            },
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [compressionData, format]);

  // Update highlighted point when slider changes
  useEffect(() => {
    if (!chartInstanceRef.current || !compressionData) return;

    const chart = chartInstanceRef.current;
    const currentFormatDatasetIndex = chart.data.datasets.length - 1;

    // Reset all points to default
    chart.data.datasets[currentFormatDatasetIndex].pointRadius = compressionData[format].map(() => 3);
    chart.data.datasets[currentFormatDatasetIndex].pointBackgroundColor = compressionData[format].map(() => FORMAT_CONFIG[format].color);

    // Highlight current point
    chart.data.datasets[currentFormatDatasetIndex].pointRadius[sliderValue] = 12;
    chart.data.datasets[currentFormatDatasetIndex].pointBackgroundColor[sliderValue] = FORMAT_CONFIG[format].color;

    chart.update('none');
  }, [sliderValue, compressionData, format]);

  if (!compressionData) {
    return <div className="format-comparison-container">Loading...</div>;
  }

  const currentData = compressionData[format][sliderValue];
  const imageSrc = `${import.meta.env.BASE_URL}image-format-comparison/${currentData.filename}`;

  return (
    <div className="format-comparison-container">
      <span className="title">{title}</span>
      <div className="content-row">
        <div className="image-section">
          <div className="image-wrapper">
            <img src={imageSrc} alt="Achilles" />
            <div className="image-info">
              <span>Qualité: {currentData.quality}</span>
              <span>Taille: {currentData.sizeKB} KB</span>
            </div>
          </div>
        </div>
        <div className="chart-section">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max="19"
          value={sliderValue}
          step="1"
          onChange={(e) => setSliderValue(parseInt(e.target.value))}
        />
      </div>
    </div>
  );
}
