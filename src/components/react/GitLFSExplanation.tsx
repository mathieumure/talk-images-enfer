import '../../styles/git-lfs-explanation.scss';

export default function GitLFSExplanation() {
  return (
    <div className="lfs-explanation-container">
      <div className="lfs-explanation-header">
        <h2>Git LFS: Comment ça fonctionne ?</h2>
        <p>Large File Storage - Gérer les fichiers volumineux efficacement</p>
      </div>

      <div className="lfs-explanation-content">
        <div className="lfs-diagram-comparison">
          <div className="lfs-diagram-side lfs-without-lfs">
            <h3>Sans LFS</h3>
            <div className="lfs-diagram-box">
              <pre>{`┌──────────────────────┐
│ Git Repository       │
│                      │
│ ├── code.js          │
│ ├── styles.css       │
│ ├── image1.png       │ ← 2 MB
│ ├── image2.png       │ ← 3 MB
│ └── image3.png       │ ← 1 MB
│                      │
└──────────────────────┘

      Problème:
  Chaque commit duplique
  les images modifiées
  dans l'historique Git

  ↓

Repo de 250 MB après
   50 commits`}</pre>
            </div>
            <div className="lfs-problem-badge">
              ❌ Repo lourd et lent
            </div>
          </div>

          <div className="lfs-diagram-divider">
            <div className="lfs-arrow">VS</div>
          </div>

          <div className="lfs-diagram-side lfs-with-lfs">
            <h3>Avec LFS</h3>
            <div className="lfs-diagram-box">
              <pre>{`┌──────────────────────┐    ┌─────────────────┐
│ Git Repository       │    │  LFS Storage    │
│                      │    │                 │
│ ├── code.js          │    │ ├── abc123.bin  │
│ ├── styles.css       │    │ ├── def456.bin  │
│ ├── image1.ptr ──────┼───→│ └── ghi789.bin  │
│ ├── image2.ptr ──────┼───→│                 │
│ └── image3.ptr ──────┼───→│  Objets réels   │
│                      │    │  (téléchargés   │
│  120 bytes/pointer   │    │  à la demande)  │
└──────────────────────┘    └─────────────────┘

  Solution:
Pointeurs légers dans Git
  Objets dans le cloud

  ↓

Repo de 5 MB + 42 MB
    objets LFS`}</pre>
            </div>
            <div className="lfs-success-badge">
              ✅ Repo léger et rapide
            </div>
          </div>
        </div>

        <div className="lfs-workflow">
          <h3>🔄 Workflow avec Git LFS</h3>
          <div className="lfs-workflow-steps">
            <div className="lfs-workflow-step">
              <div className="lfs-step-number">1</div>
              <div className="lfs-step-content">
                <div className="lfs-step-title">Installation</div>
                <code>git lfs install</code>
              </div>
            </div>
            <div className="lfs-workflow-arrow">→</div>
            <div className="lfs-workflow-step">
              <div className="lfs-step-number">2</div>
              <div className="lfs-step-content">
                <div className="lfs-step-title">Configuration</div>
                <code>git lfs track "*.png"</code>
              </div>
            </div>
            <div className="lfs-workflow-arrow">→</div>
            <div className="lfs-workflow-step">
              <div className="lfs-step-number">3</div>
              <div className="lfs-step-content">
                <div className="lfs-step-title">Usage normal</div>
                <code>git add, commit, push</code>
              </div>
            </div>
            <div className="lfs-workflow-arrow">→</div>
            <div className="lfs-workflow-step">
              <div className="lfs-step-number">4</div>
              <div className="lfs-step-content">
                <div className="lfs-step-title">Clone rapide</div>
                <code>git clone + LFS download</code>
              </div>
            </div>
          </div>
        </div>

        <div className="lfs-key-benefits">
          <div className="lfs-benefit">
            <div className="lfs-benefit-icon">⚡</div>
            <div className="lfs-benefit-text">
              <strong>Clone rapide</strong>
              <span>Repo léger, images à la demande</span>
            </div>
          </div>
          <div className="lfs-benefit">
            <div className="lfs-benefit-icon">💾</div>
            <div className="lfs-benefit-text">
              <strong>Économies d'espace</strong>
              <span>Pas de duplication d'images</span>
            </div>
          </div>
          <div className="lfs-benefit">
            <div className="lfs-benefit-icon">🔄</div>
            <div className="lfs-benefit-text">
              <strong>Transparent</strong>
              <span>Workflow Git inchangé</span>
            </div>
          </div>
          <div className="lfs-benefit">
            <div className="lfs-benefit-icon">📦</div>
            <div className="lfs-benefit-text">
              <strong>Versionning</strong>
              <span>Historique complet préservé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
