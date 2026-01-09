import '../../styles/git-lfs-real-example.scss';

export default function GitLFSRealExample() {
  return (
    <div className="lfs-real-example-container">
      <div className="lfs-real-header">
        <h2>📊 Cas réel: talk-images-enfer</h2>
        <p>Retour d'expérience sur ce projet</p>
      </div>

      <div className="lfs-real-content">
        <div className="lfs-real-stats">
          <div className="lfs-stat-card">
            <div className="lfs-stat-number">1,038</div>
            <div className="lfs-stat-label">Images du Hades Wiki</div>
          </div>
          <div className="lfs-stat-card">
            <div className="lfs-stat-number">42 MB</div>
            <div className="lfs-stat-label">Taille totale des assets</div>
          </div>
          <div className="lfs-stat-card">
            <div className="lfs-stat-number">~50</div>
            <div className="lfs-stat-label">Commits touchant les images</div>
          </div>
        </div>

        <div className="lfs-real-comparison">
          <div className="lfs-real-before">
            <h3>Sans Git LFS</h3>
            <div className="lfs-real-metric">
              <span className="lfs-metric-icon">📦</span>
              <div>
                <div className="lfs-metric-value">~250 MB</div>
                <div className="lfs-metric-desc">Taille du repo</div>
              </div>
            </div>
            <div className="lfs-real-metric">
              <span className="lfs-metric-icon">⏱️</span>
              <div>
                <div className="lfs-metric-value">~45s</div>
                <div className="lfs-metric-desc">Temps de clone</div>
              </div>
            </div>
            <div className="lfs-real-metric">
              <span className="lfs-metric-icon">👥</span>
              <div>
                <div className="lfs-metric-value">1.25 GB</div>
                <div className="lfs-metric-desc">5 développeurs</div>
              </div>
            </div>
          </div>

          <div className="lfs-real-arrow">→</div>

          <div className="lfs-real-after">
            <h3>Avec Git LFS</h3>
            <div className="lfs-real-metric">
              <span className="lfs-metric-icon">📦</span>
              <div>
                <div className="lfs-metric-value">~5 MB</div>
                <div className="lfs-metric-desc">Repo + 42 MB objets LFS</div>
              </div>
            </div>
            <div className="lfs-real-metric">
              <span className="lfs-metric-icon">⏱️</span>
              <div>
                <div className="lfs-metric-value">~3s</div>
                <div className="lfs-metric-desc">Temps de clone</div>
              </div>
            </div>
            <div className="lfs-real-metric">
              <span className="lfs-metric-icon">👥</span>
              <div>
                <div className="lfs-metric-value">235 MB</div>
                <div className="lfs-metric-desc">5 développeurs</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lfs-real-result">
          <div className="lfs-result-badge">
            <div className="lfs-result-icon">✅</div>
            <div className="lfs-result-content">
              <div className="lfs-result-main">80% d'espace économisé</div>
              <div className="lfs-result-detail">~200 MB économisés sur le repo</div>
              <div className="lfs-result-detail">93% plus rapide au clone (42s gagnées)</div>
            </div>
          </div>
        </div>

        <div className="lfs-real-notes">
          <h4>💡 Enseignements</h4>
          <ul>
            <li>Git LFS essentiel dès que vous avez plus de 100 images</li>
            <li>Clone initial rapide = meilleure expérience développeur</li>
            <li>Les objets LFS sont téléchargés à la demande lors du checkout</li>
            <li>Coût GitHub LFS: ~$0.003/mois pour ce projet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
