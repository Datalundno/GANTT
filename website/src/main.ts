import './style.css'

const GANTT_PBIVIZ =
  'https://github.com/Datalundno/GANTT/raw/main/ganttChart/downloads/ganttChart.pbiviz'
const SAMPLE_XLSX =
  'https://github.com/Datalundno/GANTT/raw/main/ganttChart/downloads/GanttSampleData.xlsx'
const REPO_URL = 'https://github.com/Datalundno/GANTT'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header" data-reveal>
    <a class="wordmark" href="#top" aria-label="Datalund home">
      <span class="wordmark-mark" aria-hidden="true"></span>
      Datalund
    </a>
    <nav class="nav" aria-label="Primary">
      <a href="#visuals">Visuals</a>
      <a href="#gantt">Gantt</a>
      <a href="/support/">Support</a>
      <a class="nav-cta" href="#get">Get the visual</a>
    </nav>
  </header>

  <main id="main">
    <section class="hero" id="top" aria-labelledby="hero-brand">
      <div class="hero-atmosphere" aria-hidden="true">
        <div class="hero-wash"></div>
        <div class="hero-grid"></div>
        <svg class="hero-viz" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" role="presentation">
          <defs>
            <linearGradient id="barA" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#2DD4BF"/>
              <stop offset="100%" stop-color="#7CFFB2"/>
            </linearGradient>
            <linearGradient id="barB" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#0F3D36"/>
              <stop offset="100%" stop-color="#1A6B5C"/>
            </linearGradient>
            <linearGradient id="barC" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#FBBF24"/>
              <stop offset="100%" stop-color="#FDE68A"/>
            </linearGradient>
            <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#E8F2EE" stop-opacity="0"/>
              <stop offset="70%" stop-color="#E8F2EE" stop-opacity="0.55"/>
              <stop offset="100%" stop-color="#E8F2EE" stop-opacity="0.95"/>
            </linearGradient>
          </defs>

          <!-- grove canopy silhouette -->
          <g class="canopy" opacity="0.18">
            <ellipse cx="180" cy="120" rx="140" ry="90" fill="#0F3D36"/>
            <ellipse cx="320" cy="90" rx="110" ry="70" fill="#145C4F"/>
            <ellipse cx="460" cy="130" rx="150" ry="85" fill="#0F3D36"/>
            <ellipse cx="1180" cy="100" rx="160" ry="95" fill="#0F3D36"/>
            <ellipse cx="1320" cy="130" rx="120" ry="70" fill="#145C4F"/>
          </g>

          <!-- timeline axis -->
          <g class="axis" stroke="#0F3D36" stroke-opacity="0.12" stroke-width="1">
            <line x1="120" y1="280" x2="1360" y2="280"/>
            <line x1="120" y1="380" x2="1360" y2="380"/>
            <line x1="120" y1="480" x2="1360" y2="480"/>
            <line x1="120" y1="580" x2="1360" y2="580"/>
            <line x1="120" y1="680" x2="1360" y2="680"/>
          </g>

          <!-- gantt bars -->
          <g class="bars">
            <rect class="bar bar-1" x="220" y="300" width="420" height="42" rx="8" fill="url(#barA)"/>
            <rect class="bar bar-2" x="380" y="400" width="520" height="42" rx="8" fill="url(#barB)"/>
            <rect class="bar bar-3" x="280" y="500" width="300" height="42" rx="8" fill="url(#barC)"/>
            <rect class="bar bar-4" x="560" y="500" width="380" height="42" rx="8" fill="url(#barA)" opacity="0.7"/>
            <rect class="bar bar-5" x="420" y="600" width="640" height="42" rx="8" fill="url(#barB)"/>
            <rect class="bar bar-6" x="700" y="300" width="280" height="42" rx="8" fill="url(#barC)" opacity="0.85"/>
          </g>

          <!-- today marker -->
          <g class="today">
            <line x1="760" y1="250" x2="760" y2="700" stroke="#0F3D36" stroke-width="2" stroke-dasharray="6 8" opacity="0.45"/>
            <circle cx="760" cy="250" r="6" fill="#FBBF24"/>
          </g>

          <rect x="0" y="0" width="1440" height="900" fill="url(#fade)"/>
        </svg>
      </div>

      <div class="hero-copy" data-reveal>
        <p class="brand" id="hero-brand">Datalund</p>
        <h1>Power BI visuals that make timelines readable.</h1>
        <p class="lede">
          Custom visualizations for project work — progress, ownership, and deadlines in one clear view.
        </p>
        <div class="cta-row">
          <a class="btn btn-primary" href="#get">Get the Gantt visual</a>
          <a class="btn btn-ghost" href="#visuals">See what’s shipping</a>
        </div>
      </div>
    </section>

    <section class="section visuals" id="visuals" aria-labelledby="visuals-title">
      <div class="section-inner" data-reveal>
        <p class="eyebrow">The studio</p>
        <h2 id="visuals-title">Built for reports people actually use.</h2>
        <p class="section-lede">
          Datalund designs Power BI custom visuals with the same care as product UI —
          dense when needed, calm by default, and tuned for Desktop workflows.
        </p>
      </div>
    </section>

    <section class="section feature" id="gantt" aria-labelledby="gantt-title">
      <div class="feature-layout">
        <div class="feature-copy" data-reveal>
          <p class="eyebrow">Featured visual</p>
          <h2 id="gantt-title">DataLund Gantt</h2>
          <p class="section-lede">
            Grouped tasks, resource colors, progress fills, a today line, hover tooltips,
            and cross-filtering — packaged as a <code>.pbiviz</code> for Power BI Desktop
            and the Visualization shop.
          </p>
          <ul class="feature-list">
            <li>Click bars to cross-filter other visuals</li>
            <li>Multi-select with Ctrl / Cmd</li>
            <li>Tooltips for dates, duration, progress, and custom fields</li>
          </ul>
        </div>
        <div class="feature-stage" data-reveal aria-hidden="true">
          <div class="stage-frame">
            <div class="stage-chrome">
              <span></span><span></span><span></span>
              <p>Project plan · sample</p>
            </div>
            <svg class="mini-gantt" viewBox="0 0 640 360" role="presentation">
              <rect width="640" height="360" fill="#F4FAF7"/>
              <g font-family="Public Sans, sans-serif" font-size="12" fill="#3D5A54">
                <text x="20" y="48">Discovery</text>
                <text x="20" y="108">Design</text>
                <text x="20" y="168">Build</text>
                <text x="20" y="228">Pilot</text>
                <text x="20" y="288">Launch</text>
              </g>
              <g stroke="#0F3D36" stroke-opacity="0.08">
                <line x1="140" y1="20" x2="140" y2="340"/>
                <line x1="260" y1="20" x2="260" y2="340"/>
                <line x1="380" y1="20" x2="380" y2="340"/>
                <line x1="500" y1="20" x2="500" y2="340"/>
              </g>
              <rect class="mini-bar d1" x="150" y="30" width="160" height="28" rx="6" fill="#2DD4BF"/>
              <rect class="mini-bar d2" x="220" y="90" width="200" height="28" rx="6" fill="#0F3D36"/>
              <rect class="mini-bar d3" x="280" y="150" width="240" height="28" rx="6" fill="#FBBF24"/>
              <rect class="mini-bar d4" x="360" y="210" width="140" height="28" rx="6" fill="#7CFFB2"/>
              <rect class="mini-bar d5" x="420" y="270" width="160" height="28" rx="6" fill="#1A6B5C"/>
              <line x1="390" y1="16" x2="390" y2="344" stroke="#0F3D36" stroke-dasharray="4 6" stroke-opacity="0.4"/>
              <circle cx="390" cy="16" r="4" fill="#FBBF24"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <section class="section get" id="get" aria-labelledby="get-title">
      <div class="section-inner get-inner" data-reveal>
        <p class="eyebrow">Power BI Desktop</p>
        <h2 id="get-title">Import the visual from a file.</h2>
        <p class="section-lede">
          Download the package, open a report in Power BI Desktop, and choose
          <strong>Import a visual from a file</strong>. Resize to ~900×400 for the best read.
        </p>
        <div class="cta-row">
          <a class="btn btn-primary" href="${GANTT_PBIVIZ}" download>Download DataLund Gantt (.pbiviz)</a>
          <a class="btn btn-ghost" href="${SAMPLE_XLSX}" download>Sample data (.xlsx)</a>
        </div>
        <p class="fineprint">
          Source and updates live on
          <a href="${REPO_URL}">GitHub</a>.
          Help: <a href="/visuals/gantt/">product page</a> ·
          <a href="/support/">support</a> ·
          <a href="/privacy/">privacy</a>.
        </p>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-inner" data-reveal>
      <p class="footer-brand">Datalund</p>
      <p class="footer-meta">
        Custom Power BI visualizations ·
        <a href="/support/">Support</a> ·
        <a href="/privacy/">Privacy</a> ·
        <a href="mailto:jonas.lundervold@gmail.com">jonas.lundervold@gmail.com</a>
      </p>
      <p class="footer-domain">datalund.no</p>
    </div>
  </footer>
`

function initReveal() {
  const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    nodes.forEach((el) => el.classList.add('is-visible'))
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  )

  nodes.forEach((el) => io.observe(el))
}

function initHeader() {
  const header = document.querySelector<HTMLElement>('.site-header')
  if (!header) return

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24)
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

initReveal()
initHeader()
