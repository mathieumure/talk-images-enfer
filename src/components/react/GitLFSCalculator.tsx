import { useState, useMemo } from 'react';
import '../../styles/git-lfs-calculator.scss';

interface GitLFSConfig {
  imageCount: number;
  avgImageSize: number; // KB
  commits: number;
  developers: number;
}

interface GitLFSMetrics {
  withoutLFS: {
    repoSize: number;
    cloneTime: number;
    localStorage: number;
  };
  withLFS: {
    repoSize: number;
    objectsSize: number;
    totalSize: number;
    cloneTime: number;
    localStorage: number;
  };
  savings: {
    space: number;
    percent: string;
    time: number;
    timePercent: string;
  };
}

function calculateMetrics(config: GitLFSConfig): GitLFSMetrics {
  const { imageCount, avgImageSize, commits, developers } = config;

  // Sans LFS: chaque commit duplique ~20% des images modifiées
  const imagesPerCommit = imageCount * 0.2;
  const totalSizeKB = imageCount * avgImageSize;
  const gitRepoSizeKB = totalSizeKB + (commits * imagesPerCommit * avgImageSize);

  // Avec LFS: pointeurs (120 bytes) + un seul stockage des objets
  const pointerSize = 0.12; // KB
  const lfsPointersKB = imageCount * pointerSize;
  const lfsObjectsKB = totalSizeKB;
  const lfsRepoSizeKB = lfsPointersKB + (commits * imagesPerCommit * pointerSize);

  // Temps de clone (estimation basée sur 10MB/s)
  const downloadSpeedMBps = 10;
  const gitCloneTimeSec = (gitRepoSizeKB / 1024) / downloadSpeedMBps;
  const lfsCloneTimeSec = (lfsRepoSizeKB / 1024) / downloadSpeedMBps;

  // Économies
  const spaceSaved = gitRepoSizeKB - lfsRepoSizeKB;
  const percentSaved = ((spaceSaved / gitRepoSizeKB) * 100).toFixed(1);
  const timeSaved = gitCloneTimeSec - lfsCloneTimeSec;
  const timePercentSaved = ((timeSaved / gitCloneTimeSec) * 100).toFixed(1);

  return {
    withoutLFS: {
      repoSize: gitRepoSizeKB,
      cloneTime: gitCloneTimeSec,
      localStorage: gitRepoSizeKB * developers,
    },
    withLFS: {
      repoSize: lfsRepoSizeKB,
      objectsSize: lfsObjectsKB,
      totalSize: lfsRepoSizeKB + lfsObjectsKB,
      cloneTime: lfsCloneTimeSec,
      localStorage: (lfsRepoSizeKB + lfsObjectsKB) * developers,
    },
    savings: {
      space: spaceSaved,
      percent: percentSaved,
      time: timeSaved,
      timePercent: timePercentSaved,
    }
  };
}

function formatSize(kb: number): string {
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}m ${secs}s`;
}

interface ConfigSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

function ConfigSlider({ label, value, onChange, min, max, step = 1, unit = '' }: ConfigSliderProps) {
  return (
    <div className="lfs-config-slider">
      <label>
        {label}
        <span className="lfs-slider-value">{value}{unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
      <div className="lfs-slider-labels">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  subtext?: string;
  color?: 'red' | 'green' | 'blue';
}

function MetricCard({ icon, label, value, subtext, color = 'green' }: MetricCardProps) {
  return (
    <div className={`lfs-metric-card lfs-metric-${color}`}>
      <div className="lfs-metric-icon">{icon}</div>
      <div className="lfs-metric-content">
        <div className="lfs-metric-label">{label}</div>
        <div className="lfs-metric-value">{value}</div>
        {subtext && <div className="lfs-metric-subtext">{subtext}</div>}
      </div>
    </div>
  );
}

export default function GitLFSCalculator() {
  const [config, setConfig] = useState<GitLFSConfig>({
    imageCount: 1038,
    avgImageSize: 40,
    commits: 20,
    developers: 5,
  });

  const metrics = useMemo(() => calculateMetrics(config), [config]);

  return (
    <div className="lfs-calculator">
      <div className="lfs-calculator-header">
        <h2>Git LFS: Calculateur d'impact</h2>
        <p>Estimez les économies pour votre projet</p>
      </div>

      <div className="lfs-calculator-controls">
        <ConfigSlider
          label="Nombre d'images"
          value={config.imageCount}
          onChange={(v) => setConfig({ ...config, imageCount: v })}
          min={10}
          max={5000}
          step={10}
        />
        <ConfigSlider
          label="Taille moyenne par image"
          value={config.avgImageSize}
          onChange={(v) => setConfig({ ...config, avgImageSize: v })}
          min={10}
          max={2000}
          step={10}
          unit=" KB"
        />
        <ConfigSlider
          label="Commits touchant des images"
          value={config.commits}
          onChange={(v) => setConfig({ ...config, commits: v })}
          min={1}
          max={100}
        />
        <ConfigSlider
          label="Développeurs dans l'équipe"
          value={config.developers}
          onChange={(v) => setConfig({ ...config, developers: v })}
          min={1}
          max={50}
        />
      </div>

      <div className="lfs-metrics-comparison">
        <div className="lfs-metric-column lfs-without">
          <h3>Sans Git LFS</h3>
          <MetricCard
            icon="📦"
            label="Taille du repo"
            value={formatSize(metrics.withoutLFS.repoSize)}
            color="red"
          />
          <MetricCard
            icon="⏱️"
            label="Temps de clone"
            value={formatTime(metrics.withoutLFS.cloneTime)}
            color="red"
          />
          <MetricCard
            icon="💾"
            label="Stockage équipe"
            value={formatSize(metrics.withoutLFS.localStorage)}
            subtext={`${config.developers} développeur${config.developers > 1 ? 's' : ''}`}
            color="red"
          />
        </div>

        <div className="lfs-metric-divider">
          <div className="lfs-savings-badge">
            <div className="lfs-savings-main">-{metrics.savings.percent}%</div>
            <div className="lfs-savings-detail">
              {formatSize(metrics.savings.space)} économisés
            </div>
            <div className="lfs-savings-time">
              {metrics.savings.timePercent}% plus rapide
            </div>
          </div>
        </div>

        <div className="lfs-metric-column lfs-with">
          <h3>Avec Git LFS</h3>
          <MetricCard
            icon="📦"
            label="Taille du repo"
            value={formatSize(metrics.withLFS.repoSize)}
            subtext={`+ ${formatSize(metrics.withLFS.objectsSize)} objets LFS`}
            color="green"
          />
          <MetricCard
            icon="⏱️"
            label="Temps de clone"
            value={formatTime(metrics.withLFS.cloneTime)}
            subtext={`${metrics.savings.timePercent}% plus rapide`}
            color="green"
          />
          <MetricCard
            icon="💾"
            label="Stockage équipe"
            value={formatSize(metrics.withLFS.localStorage)}
            color="green"
          />
        </div>
      </div>
    </div>
  );
}
