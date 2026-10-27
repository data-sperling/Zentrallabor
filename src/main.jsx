import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts'
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight,
  Download, FlaskConical, LockKeyhole, RotateCcw, Sparkles
} from 'lucide-react'
import './styles.css'

const COLORS = ['#5b67e8', '#e5a14b', '#36a58a', '#d36d88', '#8a68c7']


const EXPERIMENTS = [
  {
    id: 1,
    title: 'Genomic Analysis Nr: 01-26/10/04',
    subtitle: 'Genomic fragment analysis',
    code: 'EXP-01-26/10/04',
    description: 'Vergleichen Sie das Probensignal mit den verfügbaren Referenzkurven.',
    sampleGraph: `${import.meta.env.BASE_URL}graphs/sample-01-26-10-04/sample.csv`,
    standards: [
      `${import.meta.env.BASE_URL}graphs/sample-01-26-10-04/quinoa.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-01-26-10-04/spinach.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-01-26-10-04/thale_cress.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-01-26-10-04/red_beetroot.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-01-26-10-04/tomato.csv`,
    ],
    correct: 3,
    report: `${import.meta.env.BASE_URL}reports/Bericht-01.pdf`,
  },
  {
    id: 2,
    title: 'Microbial Reaction Nr: 02-26/10/04',
    subtitle: 'Exponential decay',
    code: 'EXP-02-26/10/04',
    description: 'Verwenden Sie Fluoreszenzmessungen und exponentiellen Abfall, um das verbleibende Pigment abzuschätzen.',
    correct: 0,
    shape: 'decay',
    report: `${import.meta.env.BASE_URL}reports/microbial-reaction-02-26-10-04.pdf`,
  },
  { id: 3,
    title: 'Cooling profile',
    subtitle: 'Thermal decay', code: 'EXP-003',
    description: 'Compare the measured cooling profile against four reference models.',
    correct: 3, shape: 'decay',
    report: '/reports/experiment-3-report.pdf'
  },
  { id: 4,
    title: 'Growth curve',
    subtitle: 'Population over time',
    code: 'EXP-004',
    description: 'Find the standard growth model that corresponds to the sample data.',
    correct: 1,
    shape: 'growth',
    report: '/reports/experiment-4-report.pdf'
  },
  { id: 5,
    title: 'Oscillation test',
    subtitle: 'Periodic response',
    code: 'EXP-005',
    description: 'Match the sample oscillation against the available reference curves.',
    correct: 2,
    shape: 'wave',
    report: '/reports/experiment-5-report.pdf'
  },
]

const VISIBLE_EXPERIMENT_IDS = [1, 2]

function curve(shape, x, variant = 0, sample = false) {
  const noise = sample ? (Math.sin(x * 3.7) + Math.cos(x * 1.3)) * 0.025 : 0
  if (shape === 'sigmoid') return 0.15 + 0.72 / (1 + Math.exp(-(x - (variant === 2 ? 5 : 2.7 + variant * 0.8)) * 0.8)) + noise
  if (shape === 'peak') return 0.12 + (0.75 - variant * 0.08) * Math.exp(-Math.pow((x - (variant === 0 ? 5 : 3 + variant * 1.2)) / (variant === 2 ? 1.05 : 1.45), 2)) + noise
  if (shape === 'decay') return 0.12 + 0.8 * Math.exp(-x * (variant === 3 ? 0.24 : 0.14 + variant * 0.055)) + noise
  if (shape === 'growth') return 0.12 + 0.8 / (1 + Math.exp(-(x - (variant === 1 ? 5.2 : 2.2 + variant * 0.65)) * 0.9)) + noise
  return 0.5 + (0.36 - variant * 0.035) * Math.sin(x * (variant === 2 ? 1.35 : 0.8 + variant * 0.2)) * Math.exp(-x * (variant === 2 ? 0.035 : 0.12)) + noise
}

function buildData(exp, variant, sample = false) {
  return Array.from({ length: 25 }, (_, i) => {
    const x = i * 0.5
    let y = curve(exp.shape, x, variant, sample)

    if (!sample && variant === exp.correct) y = curve(exp.shape, x, exp.correct, false)
    return { x, y: Math.max(0.03, Math.min(1.05, y)) }
  })
}

function CsvGraph({ src, variant, sample = false, compact = false }) {
  const [data, setData] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setData([])
    setError(false)

    fetch(src)
        .then(response => {
          if (!response.ok) throw new Error(`Could not load ${src}`)
          return response.text()
        })
        .then(csv => {
          const rows = csv.trim().replace(/^\uFEFF/, '').split(/\r?\n/)
          if (rows.length < 2) throw new Error('CSV has no data rows')
          const headers = rows[0].split(',').map(header => header.trim())
          const xIndex = headers.indexOf('fragment_size_bp')
          const yIndex = headers.indexOf('signal_intensity_au')
          if (xIndex < 0 || yIndex < 0) throw new Error('CSV headers do not match the expected format')

          const parsed = rows.slice(1).filter(row => row.trim()).map(row => {
            const columns = row.split(',')
            return { x: Number(columns[xIndex]), y: Number(columns[yIndex]) }
          }).filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))

          if (!parsed.length) throw new Error('CSV contains no valid numeric data')
          if (!cancelled) setData(parsed)
        })
        .catch(() => {
          if (!cancelled) setError(true)
        })

    return () => { cancelled = true }
  }, [src])

  const graphClass = `graph ${compact ? 'graph-compact' : ''}`
  if (error) return <div className={graphClass}><p className="graph-message">Could not load graph data.</p></div>
  if (!data.length) return <div className={graphClass}><p className="graph-message">Loading graph…</p></div>

  return (
      <div className={graphClass}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#e9ebf3" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="x" type="number" domain={[100, 1000]} tick={{ fontSize: 10, fill: '#8a91a6' }} tickLine={false} axisLine={{ stroke: '#dfe3ed' }} tickCount={5} />
            {/* Keep the same Y range for the sample and standards so their shapes are comparable. */}
            <YAxis domain={[0, 30]} tick={{ fontSize: 10, fill: '#8a91a6' }} tickLine={false} axisLine={false} tickCount={4} />
            <Tooltip
                contentStyle={{ border: '1px solid #e4e7f0', borderRadius: 10, fontSize: 12 }}
                formatter={value => [Number(value).toFixed(3), 'Signal intensity']}
                labelFormatter={label => `Fragment size: ${Number(label).toFixed(2)} bp`}
            />
            {sample && <Area type="monotone" dataKey="y" stroke="none" fill="#5b67e8" fillOpacity={0.09} isAnimationActive={false} />}
            <Line type="monotone" dataKey="y" stroke={sample ? '#3847d6' : COLORS[variant]} strokeWidth={sample ? 2.8 : 2.4} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
  )
}

function Graph({ exp, variant, sample = false, compact = false }) {
  const data = useMemo(() => buildData(exp, variant, sample), [exp, variant, sample])
  const csvPath = sample ? exp.sampleGraph : exp.standards?.[variant]


  if (csvPath) return <CsvGraph src={csvPath} variant={variant} sample={sample} compact={compact} />

  return (
      <div className={`graph ${compact ? 'graph-compact' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#e9ebf3" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#8a91a6' }} tickLine={false} axisLine={{ stroke: '#dfe3ed' }} tickCount={5} />
            <YAxis domain={[0, 1.05]} tick={{ fontSize: 10, fill: '#8a91a6' }} tickLine={false} axisLine={false} tickCount={4} />
            <Tooltip
                contentStyle={{ border: '1px solid #e4e7f0', borderRadius: 10, fontSize: 12 }}
                formatter={(value) => [Number(value).toFixed(3), 'Response']}
                labelFormatter={(label) => `Time: ${label}`}
            />
            {sample && <Area type="monotone" dataKey="y" stroke="none" fill="#5b67e8" fillOpacity={0.09} isAnimationActive={false} />}
            <Line type="monotone" dataKey="y" stroke={sample ? '#3847d6' : COLORS[variant]} strokeWidth={sample ? 2.8 : 2.4} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
  )
}


function Experiment2View() {
  const [fluorescence, setFluorescence] = useState([])
  const [decay, setDecay] = useState([])
  const [error, setError] = useState(false)
  const [answer, setAnswer] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const [fluorResponse, decayResponse] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}graphs/sample-02-26-10-04/sample_470nm_fluor.csv`),
          fetch(`${import.meta.env.BASE_URL}graphs/sample-02-26-10-04/sample_510nm_fluor_decay.csv`),
        ])

        if (!fluorResponse.ok || !decayResponse.ok) {
          throw new Error('Could not load Experiment 2 CSV files')
        }

        const [fluorText, decayText] = await Promise.all([
          fluorResponse.text(),
          decayResponse.text(),
        ])

        function parseCsv(text) {
          const rows = text.trim().replace(/^\uFEFF/, '').split(/\r?\n/)
          const headers = rows[0].split(',').map(h => h.trim())

          return rows.slice(1).filter(Boolean).map(row => {
            const values = row.split(',')
            return Object.fromEntries(
                headers.map((header, i) => [header, Number(values[i])])
            )
          })
        }

        const fluorRows = parseCsv(fluorText)
        const decayRows = parseCsv(decayText)

        if (
            !fluorRows.length ||
            !decayRows.length ||
            !('time_hours' in fluorRows[0]) ||
            !('fluorescence_intensity_au' in fluorRows[0]) ||
            !('ln_normalised_fluorescence' in decayRows[0])
        ) {
          throw new Error('Unexpected CSV column names')
        }

        if (!cancelled) {
          setFluorescence(fluorRows)
          setDecay(decayRows)
        }
      } catch (err) {
        if (!cancelled) setError(true)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [])

  if (error) {
    return (
        <section className="panel experiment2-panel">
          <h2>Experiment data unavailable</h2>
          <p>Check that both CSV files are in the public directory
            and that their column names match the expected format.</p>
        </section>
    )
  }

  if (!fluorescence.length || !decay.length) {
    return <section className="panel experiment2-panel">
      <p>Loading Experiment 2 data…</p>
    </section>
  }

  return (
      <section className="experiment2-layout">
        <div className="panel experiment2-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-index">01</span>
              <h2>Fluoreszenz im Laufe der Zeit</h2>
            </div>
            <span className="sample-tag">SIMULATED DATA</span>
          </div>

          <p className="panel-description">
            Anregung: 470 nm. Fluoreszenzemission gemessen bei 510 nm.
            Folgen Sie dem Signal, während das simulierte Pigment abgebaut wird.
          </p>

          <div className="experiment2-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fluorescence}
                         margin={{ top: 12, right: 20, left: 5, bottom: 12 }}>
                <CartesianGrid stroke="#e9ebf3" strokeDasharray="3 5" />
                <XAxis dataKey="time_hours" type="number"
                       domain={[0, 48]} tickCount={7}
                       label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5 }} />
                <YAxis
                    label={{ value: 'Fluorescence (AU)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                    labelFormatter={v => `Time: ${v} h`}
                    formatter={v => [Number(v).toFixed(2), 'Intensity (AU)']} />
                <Line dataKey="fluorescence_intensity_au"
                      name="Fluorescence intensity"
                      stroke="#5b67e8" strokeWidth={2.5}
                      dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel experiment2-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-index">02</span>
              <h2>Logarithmisch normalisierter Zerfall</h2>
            </div>
          </div>

          <p className="panel-description">
            Durch die Verwendung des natürlichen Logarithmus wird der exponentielle Zerfall in eine gerade Linie umgewandelt.


          </p>

          <div className="experiment2-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={decay}
                         margin={{ top: 12, right: 20, left: 5, bottom: 12 }}>
                <CartesianGrid stroke="#e9ebf3" strokeDasharray="3 5" />
                <XAxis dataKey="time_hours" type="number"
                       domain={[0, 48]} tickCount={7}
                       label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5 }} />
                <YAxis
                    label={{ value: 'ln(At / A0)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                    labelFormatter={v => `Time: ${v} h`}
                    formatter={v => [Number(v).toFixed(4), 'ln(At / A0)']} />
                <Line dataKey="ln_normalised_fluorescence"
                      name="Log-normalised fluorescence"
                      stroke="#36a58a" strokeWidth={2.5}
                      dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel experiment2-panel maths-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-index">03</span>
              <h2>Verwenden Sie die Zerfallsgleichung</h2>
            </div>
          </div>

          <p>Für exponentiellen Zerfall erster Ordnung:</p>
          <div className="equation">
            A<sub>t</sub> = A<sub>0</sub> e<sup>−kt</sup>
          </div>

          <p>Teilen Sie durch das Anfangssignal A<sub>0</sub>:</p>
          <div className="equation">
            A<sub>t</sub> / A<sub>0</sub> = e<sup>−kt</sup>
          </div>

          <p>Nehmen Sie den natürlichen Logarithmus beider Seiten:</p>
          <div className="equation">
            ln(A<sub>t</sub> / A<sub>0</sub>) = −kt
          </div>

          <p>
            Dies hat die geradlinige Form <strong>y = mx + c</strong>,
            wo y = ln(A<sub>t</sub> / A<sub>0</sub>), x = t,
            der Farbverlauft m = −k, and c = 0 für ideal normalisierte Daten.
          </p>

          <div className="equation">
            k = ln(2) / 12 ≈ 0.05776 h<sup>−1</sup>
          </div>

          <p>
            Verwenden Sie den Gradienten oder die Grafik, um den Rest abzuschätzen
            Fluoreszenz nach 24 Stunden. Bei diesem Modell handelt es sich um Fluoreszenz
            ist proportional zur Menge des intakten Pigments.
          </p>

          <h3>Wie viel bleibt nach 24 Stunden übrig?</h3>
          <div className="answer-options experiment2-options">
            {[25, 50, 75, 100].map(value => (
                <button key={value}
                        className={`answer-option ${
                            answer === value
                                ? value === 25 ? 'answer-correct' : 'answer-wrong'
                                : ''
                        }`}
                        onClick={() => setAnswer(value)}>
                  <span className="answer-letter">{value}%</span>
                  <span>{value}% verbleibend</span>
                </button>
            ))}
          </div>

          {answer !== null && (
              <>
                <p className={answer === 25
                    ? 'feedback success-feedback'
                    : 'feedback error-feedback'}>
                  {answer === 25
                      ? 'Richtig. Es sind zwei 12-Stunden-Halbwertszeiten verstrichen, sodass noch 25 % übrig sind.'
                      : 'Nicht ganz. Überprüfen Sie, wie viele 12-Stunden-Halbwertszeiten in 24 Stunden passen.'}
                </p>

                {answer === 25 && (
                    <a
                        className="download-button"
                        href={`${import.meta.env.BASE_URL}reports/microbial-reaction-02-26-10-04.pdf`}
                        download
                    >
                      <Download size={17} />
                      Analysebericht herunterladen
                      <ArrowRight size={15} />
                    </a>
                )}
              </>
          )}
        </div>
      </section>
  )
}


function FluorescenceThumbnail() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch(
        `${import.meta.env.BASE_URL}graphs/sample-02-26-10-04/sample_470nm_fluor.csv`
    )
        .then(response => {
          if (!response.ok) throw new Error('Could not load fluorescence data')
          return response.text()
        })
        .then(csv => {
          const rows = csv.trim().replace(/^\uFEFF/, '').split(/\r?\n/)
          const headers = rows[0].split(',').map(h => h.trim())
          const xIndex = headers.indexOf('time_hours')
          const yIndex = headers.indexOf('fluorescence_intensity_au')

          if (xIndex < 0 || yIndex < 0) {
            throw new Error('Unexpected CSV headers')
          }

          setData(
              rows.slice(1)
                  .filter(row => row.trim())
                  .map(row => {
                    const columns = row.split(',')
                    return {
                      x: Number(columns[xIndex]),
                      y: Number(columns[yIndex]),
                    }
                  })
                  .filter(point =>
                      Number.isFinite(point.x) && Number.isFinite(point.y)
                  )
          )
        })
        .catch(error => console.error(error))
  }, [])

  if (!data.length) return <div className="graph graph-compact" />

  return (
      <div className="graph graph-compact">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid
                stroke="#e9ebf3"
                strokeDasharray="3 5"
                vertical={false}
            />
            <XAxis dataKey="x" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Area
                type="monotone"
                dataKey="y"
                stroke="none"
                fill="#e5a14b"
                fillOpacity={0.16}
                isAnimationActive={false}
            />
            <Line
                type="monotone"
                dataKey="y"
                stroke="#e5a14b"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
  )
}

function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [activeStandard, setActiveStandard] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const exp = EXPERIMENTS.find(item => item.id === selectedId)
  const completed = answer === exp?.correct

  function openExperiment(id) {
    setSelectedId(id)
    setActiveStandard(0)
    setAnswer(null)
    setAttempts(0)
    window.history.pushState({ experiment: id }, '', `?experiment=${id}`)
  }
  function goHome() {
    setSelectedId(null)
    setAnswer(null)
    window.history.pushState({}, '', window.location.pathname)
  }
  function choose(index) {
    if (completed) return
    setAnswer(index)
    setAttempts(n => n + 1)
  }

  const standardCount = exp?.standards?.length ?? 4
  function nextStandard() { setActiveStandard(i => (i + 1) % standardCount) }
  function prevStandard() { setActiveStandard(i => (i + standardCount - 1) % standardCount) }

  React.useEffect(() => {
    const onPop = () => {
      const id = Number(new URLSearchParams(window.location.search).get('experiment'))
      setSelectedId(EXPERIMENTS.some(e => e.id === id) ? id : null)
      setAnswer(null)
    }
    const id = Number(new URLSearchParams(window.location.search).get('experiment'))
    if (EXPERIMENTS.some(e => e.id === id)) setSelectedId(id)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
      <div className="app-shell">
        <header className="topbar">
          <button className="brand" onClick={goHome} aria-label="Go to home">
            <span className="brand-mark"><FlaskConical size={20} /></span>
            <span>Zentral<span className="brand-accent">labor</span></span>
          </button>
          <div className="topbar-right"><span className="status-dot" /> Zentrallabor <span className="topbar-divider">/</span> Benutzerdefinierte Analyse </div>
        </header>

        {!exp ? (
            <main className="landing">
              <div className="hero">
                <div className="eyebrow"><Sparkles size={14} /> </div>
                <h1>Identifizieren Sie das Muster<br /></h1>
                <p className="hero-copy">Vergleichen Sie experimentelle Ergebnisse mit Standardkurven. Finden Sie die Übereinstimmung, um den vollständigen Analysebericht freizuschalten.</p>
                <div className="hero-stats">
                  <div><strong>{String(VISIBLE_EXPERIMENT_IDS.length).padStart(2, '0')}</strong>
                    <span>Experiments</span></div>
                  <div className="stat-rule" />
                  <div><strong>05</strong><span>Standards in Experiment 1</span></div>
                  <div className="stat-rule" />
                  <div><strong>01</strong><span>Correct match</span></div>
                </div>
              </div>


              <section className="experiment-section">
                <div className="section-heading">
                  <div>
                    <div className="section-kicker">YOUR WORKSPACE</div>
                    <h2>Choose an experiment</h2>
                  </div>
                  <span className="section-count">
                    {String(VISIBLE_EXPERIMENT_IDS.length).padStart(2, '0')} AVAILABLE <span>↗</span>
                  </span>
                </div>

                <div className="experiment-grid">
                  {EXPERIMENTS
                      .filter(item => VISIBLE_EXPERIMENT_IDS.includes(item.id))
                      .map((item, i) => (
                      <button
                          className="experiment-card"
                          key={item.id}
                          onClick={() => openExperiment(item.id)}
                      >
                        <div className="card-top">
                          <span className="card-code">{item.code}</span>
                          <span className="card-number">
            {String(item.id).padStart(2, '0')}
          </span>
                        </div>

                        <div className="mini-graph">
                          {item.id === 2 ? (
                              <FluorescenceThumbnail />
                          ) : (
                              <Graph exp={item} variant={i % 4} compact />
                          )}
                        </div>

                        <div className="card-content">
                          <h3>{item.title}</h3>
                          <p>{item.subtitle}</p>
                        </div>

                        <div className="card-footer">
                          <span>offenes Experiment</span>
                          <ArrowRight size={16} />
                        </div>
                      </button>
                  ))}
                </div>
              </section>

              <footer className="landing-footer">
                <span>Zentrallabor / DATA INTERPRETATION SUITE</span>
                <span>Beispielkurven zur Identifizierung</span>
              </footer>
            </main>
        ) : (
            <main className="workspace">
              <button className="back-link" onClick={goHome}><ArrowLeft size={16} /> Alle Experimente</button>
              <div className="workspace-heading">
                <div><div className="eyebrow"><span className="live-dot" /> {exp.code} <span className="eyebrow-slash">/</span> </div><h1>{exp.title}</h1><p>{exp.description}</p></div>
                <div className="progress-chip"><span className="progress-number">0{exp.id}</span><span className="progress-slash">/</span><span>05 experiments</span></div>
              </div>

              {exp.id === 2 ? (
                  <Experiment2View />
              ) : (
              <div className="comparison-layout">
                <section className="panel sample-panel">
                  <div className="panel-heading"><div><span className="panel-index">01</span><h2>Experimentelle Probe</h2></div><span className="sample-tag">UNKNOWN</span></div>
                  <p className="panel-description">Referenzkurve zum Vergleich mit den Standards.</p>
                  <div className="sample-chart"><Graph exp={exp} variant={exp.correct} sample /></div>
                  <div className="chart-axis-caption"><span>{exp.sampleGraph ? 'FRAGMENT SIZE / BP' : 'TIME / X'}</span><span>{exp.sampleGraph ? 'SIGNAL INTENSITY / AU' : 'RESPONSE / Y'}</span></div>
                  <div className="sample-meta"><div><span>DATA POINTS</span><strong>{exp.sampleGraph ? 'CSV measurements' : '25 readings'}</strong></div><div><span>MEASUREMENT</span><strong>{exp.sampleGraph ? 'Signal intensity (AU)' : 'Normalized response'}</strong></div></div>
                  <div className="hint-box"><span className="hint-icon"><Sparkles size={16} /></span><p><strong>Suchen Sie nach der Beziehung.</strong> Konzentrieren Sie sich auf die Gesamtform, den Höhepunkt und die Änderungsrate der Kurve.</p></div>
                </section>

                <section className="panel standards-panel">
                  <div className="panel-heading"><div><span className="panel-index">02</span><h2>Standardkurven</h2></div><span className="standard-count">{standardCount} OPTIONS</span></div>
                  <p className="panel-description">Blättern Sie durch die Standards und wählen Sie dann denjenigen aus, der zur Probe passt.</p>

                  <div className="carousel">
                    <button className="carousel-arrow" onClick={prevStandard} aria-label="Previous standard"><ChevronLeft size={20} /></button>
                    <div className="standard-card">
                      <div className="standard-card-top"><span className="standard-label">STANDARD CURVE</span><span className="standard-position">0{activeStandard + 1} <span>/ {String(standardCount).padStart(2, '0')}</span></span></div>
                      <div className="standard-name-row"><div><span className="standard-dot" style={{ background: COLORS[activeStandard] }} /><h3>Standard {String.fromCharCode(65 + activeStandard)}</h3></div><span className="standard-code">REF-0{activeStandard + 1}</span></div>
                      <div className="standard-chart"><Graph exp={exp} variant={activeStandard} /></div>
                      <div className="chart-axis-caption"><span>{exp.sampleGraph ? 'FRAGMENT SIZE / BP' : 'TIME / X'}</span><span>{exp.sampleGraph ? 'SIGNAL INTENSITY / AU' : 'RESPONSE / Y'}</span></div>
                      <div className="standard-card-bottom"><span>Reference data</span><span>{activeStandard + 1} of {standardCount}</span></div>
                    </div>
                    <button className="carousel-arrow" onClick={nextStandard} aria-label="Next standard"><ChevronRight size={20} /></button>
                  </div>
                  <div className="carousel-dots" aria-label="Select a standard">
                    {Array.from({ length: standardCount }, (_, i) => <button key={i} onClick={() => setActiveStandard(i)} className={`carousel-dot ${i === activeStandard ? 'active' : ''}`} aria-label={`Show standard ${String.fromCharCode(65+i)}`} />)}
                  </div>

                  <div className="answer-area">
                    {completed ? (
                        <div className="success-state"><div className="success-icon"><CheckCircle2 size={22} /></div><div className="success-copy"><h3>Correct match!</h3><p>You've identified the matching standard. The full analysis is ready.</p><a className="download-button" href={exp.report} download><Download size={17} /> Download analysis report <ArrowRight size={15} /></a></div></div>
                    ) : (
                        <>
                          <div className="answer-heading"><div><span className="panel-index">03</span><h2>Treffen Sie Ihre Auswahl</h2></div><span className="attempts">{attempts} {attempts === 1 ? 'attempt' : 'attempts'}</span></div>
                          <p className="panel-description">Welche Standardkurve passt am besten zur experimentellen Probe?</p>
                          <div className="answer-options">
                            {Array.from({ length: standardCount }, (_, i) => <button key={i} onClick={() => choose(i)} className={`answer-option ${answer === i ? (i === exp.correct ? 'answer-correct' : 'answer-wrong') : ''}`}><span className="answer-letter">{String.fromCharCode(65+i)}</span><span>Standard {String.fromCharCode(65+i)}</span>{answer === i && (i === exp.correct ? <CheckCircle2 size={17} /> : <RotateCcw size={16} />)}{answer !== i && <ArrowRight className="answer-arrow" size={15} />}</button>)}
                          </div>
                          {answer !== null && answer !== exp.correct && <p className="feedback error-feedback">Not quite — compare the shape and try another standard.</p>}
                          <div className="privacy-note"><LockKeyhole size={13} /> The report unlocks when you find the correct match.</div>
                        </>
                    )}
                  </div>
                </section>
              </div>)}
              <footer className="workspace-footer">
                <span>ZENTRALLABOR / {exp.code}</span>
                <button onClick={goHome}>
                  Exit experiment <ArrowRight size={13} />
                </button>
              </footer>
            </main>
        )}
      </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)

