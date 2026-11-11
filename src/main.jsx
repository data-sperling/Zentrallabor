import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts'
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight,
  Download, FlaskConical, LockKeyhole, RotateCcw, Sparkles, BookOpenText
} from 'lucide-react'
import './styles.css'

const COLORS = ['#5b67e8', '#e5a14b', '#36a58a', '#d36d88', '#8a68c7']


const EXPERIMENTS = [
  {
    id: 1,
    title: 'Genomanalyse\nNr: 01-26/09/20',
    subtitle: 'Analyse genomischer Fragmente',
    code: 'EXP-01-26/09/20',
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
    report: `${import.meta.env.BASE_URL}reports/sample-01-26-10-04/Bericht-01.pdf`,
    reportPage: `${import.meta.env.BASE_URL}reports/sample-01-26-10-04/report-01.html`,
  },
  {
    id: 2,
    title: 'Mikrobielle Reaktion\nNr: 02-26/09/20',
    subtitle: 'Exponential decay',
    code: 'EXP-02-26/09/20',
    description: 'Verwenden Sie Fluoreszenzmessungen und exponentiellen Abfall, um das verbleibende Pigment abzuschätzen.',
    correct: 0,
    shape: 'decay',
    report: `${import.meta.env.BASE_URL}reports/microbial-reaction-02-26-10-04.pdf`,
  },
  {
    id: 3,
    title: 'NMR-Gemischanalyse\nNr: 03-26/09/20',
    subtitle: '1H NMR spectral identification',
    code: 'EXP-03-26/09/20',
    description: 'Vergleichen Sie die 1H-NMR-Referenzspektren, um die unbekannte Komponente in der Probe zu identifizieren.',
    nmrSampleGraphs: [
      `${import.meta.env.BASE_URL}graphs/sample-03-26-10-04/6-gingerol.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-03-26-10-04/ethanol.csv`,
    ],
    standards: [
      `${import.meta.env.BASE_URL}graphs/sample-03-26-10-04/2-2-difluorobutane.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-03-26-10-04/2-propanol.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-03-26-10-04/ethanol.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-03-26-10-04/ethyl_methyl_ether.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-03-26-10-04/prop-1-en-2-ol.csv`,
    ],
    standardNames: [
      '2,2-difluorobutane',
      '2-propanol',
      '1-hydroxy-2-ethyl',
      'ethyl methyl ether',
      'prop-1-en-2-ol',
    ],
    correct: 2,
    report: `${import.meta.env.BASE_URL}reports/Bericht-03.pdf`,
    reportPage: `${import.meta.env.BASE_URL}reports/sample-03-26-10-04/report-03.html`,
  },
  {
    id: 4,
    title: 'HPLC-Methode\nNr: 04-26/09/20',
    subtitle: 'Identifizierung einer unbekannten Probe',
    code: 'EXP-04-26/09/20',
    description: 'Ein Schokoladenextrakt wurde mittels HPLC getrennt. Wählen Sie die geeignete analytische Methode zur Identifizierung der getrennten Substanzen.',
    sampleGraph: `${import.meta.env.BASE_URL}graphs/sample-04-26-10-04/chocolate.csv`,
    techniques: [
      'Atomspektroskopie',
      'Elektronenparamagnetische Resonanz',
      'Kalium-Argon-Datierung',
      'Röntgenabsorptionsspektroskopie',
      'Massenspektrometrie',
    ],
    correct: 4,
    reportPage: `${import.meta.env.BASE_URL}reports/sample-04-26-10-04/report-04.html`,
  },
  {
    id: 5,
    title: 'XRD-Gemischanalyse\nNr: 05-26/09/20',
    subtitle: 'Röntgendiffraktometrische Phasenidentifizierung',
    code: 'EXP-05-26/09/20',
    description: 'Identifizieren Sie die unbekannte Komponente gemischt mit Kakaobutter im XRD-Spektrum',
    sampleGraph: `${import.meta.env.BASE_URL}graphs/sample-05-26-10-04/cocoa-butter.csv`,
    standards: [
      `${import.meta.env.BASE_URL}graphs/sample-05-26-10-04/Ag.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-05-26-10-04/Au.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-05-26-10-04/corundum.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-05-26-10-04/FeS2.csv`,
      `${import.meta.env.BASE_URL}graphs/sample-05-26-10-04/glucose.csv`,
    ],
    standardNames: [
      'Silber',
      'Gold',
      'Korund',
      'Eisenpyrit',
      'Glucose',
    ],
    correct: 3,
    reportPage: `${import.meta.env.BASE_URL}reports/sample-05-26-10-04/report-05.html`,
  },
]

console.log('Experiment 4 title:', JSON.stringify(EXPERIMENTS.find(item => item.id === 4)?.title));

const VISIBLE_EXPERIMENT_IDS = [1, 2, 3, 4, 5]
const LOCKOUT_STORAGE_KEY = 'zentrallabor-lockout-until'

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


function CsvGraph({ src, overlaySrc, variant, sample = false, compact = false }) {
  const [data, setData] = useState([])
  const [error, setError] = useState(false)
  const [isTime, setIsTime] = useState(false)
  const [isXrd, setIsXrd] = useState(false)

  useEffect(() => {
    let cancelled = false
    setData([])
    setError(false)
    setIsTime(false)
    setIsXrd(false)

    const loadSpectrum = async (url) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Could not load ${url}`)

      const csv = await response.text()
      const rows = csv.trim().replace(/^\uFEFF/, '').split(/\r?\n/)

      if (rows.length < 2) throw new Error('CSV has no data rows')

      const headers = rows[0].split(',').map(header => header.trim())

      const timeData = headers.includes('time_min')
      const xrdData = headers.includes('X-axis')

      const xHeader = timeData
          ? 'time_min'
          : xrdData
              ? 'X-axis'
              : 'fragment_size_bp'

      const xIndex = headers.indexOf(xHeader)
      const yHeader = xrdData ? 'Y-value' : 'signal_intensity_au'
      const yIndex = headers.indexOf(yHeader)

      if (xIndex < 0 || yIndex < 0) {
        throw new Error('CSV headers do not match the expected format')
      }

      const points = rows.slice(1)
          .filter(row => row.trim())
          .map(row => {
            const columns = row.split(',')
            return {
              x: Number(columns[xIndex]),
              y: Number(columns[yIndex])
            }
          })
          .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))

      if (!points.length) throw new Error('CSV contains no valid numeric data')

      return { points, timeData, xrdData }
    }


    Promise.all([
      loadSpectrum(src),
      overlaySrc ? loadSpectrum(overlaySrc) : Promise.resolve(null)
    ])
        .then(([main, overlay]) => {
          if (overlay) {
            if (main.xrdData !== overlay.xrdData) {
              throw new Error('Spectrum formats do not match')
            }

            const merged = new Map()

            main.points.forEach(point => {
              const key = point.x.toFixed(8)
              merged.set(key, {
                x: point.x,
                y: point.y,
                overlayY: null
              })
            })

            overlay.points.forEach(point => {
              const key = point.x.toFixed(8)

              if (merged.has(key)) {
                merged.get(key).overlayY = point.y
              } else {
                merged.set(key, {
                  x: point.x,
                  y: null,
                  overlayY: point.y
                })
              }
            })

            main.points = [...merged.values()].sort((a, b) => a.x - b.x)
          }

          if (!cancelled) {
            setData(main.points)
            setIsTime(main.timeData)
            setIsXrd(main.xrdData)
          }
        })
        .catch(() => {
          if (!cancelled) setError(true)
        })

    return () => { cancelled = true }
  }, [src, overlaySrc])


  const graphClass = `graph ${compact ? 'graph-compact' : ''}`

  if (error) return <div
      className={graphClass}>
    <p className="graph-message">Could not load graph data.</p></div>
  if (!data.length) return <div className={graphClass}><p className="graph-message">Loading graph…</p></div>

  return (
      <div className={graphClass}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
            {!compact && (
                <>
                  <CartesianGrid stroke="#e9ebf3" strokeDasharray="3 5" vertical={false} />
                  <XAxis
                      dataKey="x"
                      type="number"
                      domain={isTime ? [0, 10] : isXrd ? ['dataMin', 'dataMax'] : [100, 1000]}
                      tick={{ fontSize: 10, fill: '#8a91a6' }}
                      tickLine={false}
                      axisLine={{ stroke: '#dfe3ed' }}
                      tickCount={5}
                  />
                  <YAxis
                      domain={isTime || isXrd ? [0, 'auto'] : [0, 30]}
                      tick={{ fontSize: 10, fill: '#8a91a6' }}
                      tickLine={false}
                      axisLine={false}
                      tickCount={4}
                  />
                  <Tooltip
                      contentStyle={{ border: '1px solid #e4e7f0', borderRadius: 10, fontSize: 12 }}
                      formatter={(value, name) => [Number(value).toFixed(3), name]}
                      labelFormatter={label =>
                          isTime
                              ? `Retention time: ${Number(label).toFixed(2)} min`
                              : isXrd
                                  ? `2θ: ${Number(label).toFixed(2)}°`
                                  : `Fragment size: ${Number(label).toFixed(2)} bp`
                      }
                  />
                </>
            )}

            {sample && !overlaySrc && (
                <Area
                    type="monotone"
                    dataKey="y"
                    stroke="none"
                    fill="#5b67e8"
                    fillOpacity={0.09}
                    isAnimationActive={false}
                />
            )}

            <Line
                type="monotone"
                dataKey="y"
                name={overlaySrc ? 'Cocoa butter' : 'Signal intensity'}
                stroke={compact ? '#3847d6' : overlaySrc ? '#eab308' : sample ? '#3847d6' : COLORS[variant]}
                strokeWidth={sample ? 2.8 : 2.4}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
            />

            {overlaySrc && (
                <Line
                    type="monotone"
                    dataKey="overlayY"
                    name="Unknown"
                    stroke={compact ? '#d94b4b' : '#16a34a'}
                    strokeWidth={2.8}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
  )
}


function NmrGraph({ src, overlaySrc, compact = false }) {
  const [data, setData] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadSpectra() {
      setData([])
      setError(false)

      try {
        const sources = [src, overlaySrc].filter(Boolean)

        const responses = await Promise.all(
            sources.map(path => fetch(path))
        )

        if (responses.some(response => !response.ok)) {
          throw new Error('Could not load NMR spectrum')
        }

        const csvFiles = await Promise.all(
            responses.map(response => response.text())
        )

        function parseSpectrum(csv) {
          const rows = csv.trim().replace(/^\uFEFF/, '').split(/\r?\n/)
          const headers = rows[0].split(',').map(header => header.trim())
          const xIndex = headers.indexOf('x')
          const yIndex = headers.indexOf('y')

          if (xIndex < 0 || yIndex < 0) {
            throw new Error('NMR CSV must contain x,y columns')
          }

          return rows.slice(1)
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
        }

        const spectra = csvFiles.map(parseSpectrum)

        if (spectra.some(spectrum => spectrum.length === 0)) {
          throw new Error('NMR spectrum contains no valid data')
        }

        let combined = spectra[0].map((point, index) => {
          const result = { x: point.x, y1: point.y }

          if (spectra[1]) {
            const secondPoint = spectra[1][index]

            if (!secondPoint || Math.abs(point.x - secondPoint.x) > 0.000001) {
              throw new Error('NMR spectra use different chemical-shift grids')
            }

            result.y2 = secondPoint.y
          }

          return result
        })

        if (!cancelled) setData(combined)
      } catch (err) {
        console.error('NMR graph loading error:', err)
        if (!cancelled) setError(true)
      }
    }

    loadSpectra()

    return () => {
      cancelled = true
    }
  }, [src, overlaySrc])

  const graphClass = `graph ${compact ? 'graph-compact' : ''}`

  if (error) {
    return <div className={graphClass}>
      <p className="graph-message">Could not load NMR data.</p>
    </div>
  }

  if (!data.length) {
    return <div className={graphClass}>
      <p className="graph-message">Loading NMR spectrum…</p>
    </div>
  }


  return (
      <div className={graphClass}>

        {overlaySrc && !compact && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              marginBottom: '6px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              <span style={{ color: '#3847d6' }}>6-gingerol</span>
              <span style={{ color: '#d94b4b' }}>Unbekannt</span>
            </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
              data={data}
              margin={{ top: 12, right: 18, left: 5, bottom: 5 }}
          >
            {!compact && (
                <>
                  <CartesianGrid stroke="#e9ebf3" strokeDasharray="3 5" />

                  <XAxis
                      dataKey="x"
                      type="number"
                      domain={[0, 10]}
                      tick={{ fontSize: 10, fill: '#8a91a6' }}
                      tickLine={false}
                      axisLine={{ stroke: '#dfe3ed' }}
                      tickCount={6}
                      label={{
                        value: 'Chemical shift (ppm)',
                        position: 'insideBottom',
                        offset: -2,
                      }}
                  />

                  <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10, fill: '#8a91a6' }}
                      tickLine={false}
                      axisLine={false}
                      tickCount={4}
                  />

                  <Tooltip
                      contentStyle={{
                        border: '1px solid #e4e7f0',
                        borderRadius: 10,
                        fontSize: 12
                      }}
                      formatter={(value, name) => [
                        Number(value).toFixed(3),
                        name
                      ]}
                      labelFormatter={label =>
                          `Chemical shift: ${Number(label).toFixed(2)} ppm`
                      }
                  />
                </>
            )}

            <Line
                dataKey="y1"
                name={overlaySrc ? '6-gingerol' : 'Reference spectrum'}
                stroke={overlaySrc ? '#3847d6' : '#5b67e8'}
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
            />

            {overlaySrc && (
                <Line
                    dataKey="y2"
                    name="unbekannte Komponente"
                    stroke="#d94b4b"
                    strokeWidth={1.8}
                    dot={false}
                    isAnimationActive={false}
                />
            )}
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
              <Line
                  type="monotone"
                  dataKey="y"
                  stroke={sample ? '#3847d6' : COLORS[variant]}
                  strokeWidth={sample ? 2.8 : 2.4} dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

  )
}



function Experiment2View({ locked, onIncorrect, lockoutSeconds }) {
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
                <button
                    key={value}
                    disabled={locked || answer === 25}
                    className={`answer-option ${
                        answer === value
                            ? value === 25 ? 'answer-correct' : 'answer-wrong'
                            : ''
                    }`}
                    onClick={() => {
                      if (locked || answer === 25) return

                      setAnswer(value)

                      if (value !== 25) {
                        onIncorrect()
                      }
                    }}
                >
                  <span className="answer-letter">{value}%</span>
                  <span>{value}% verbleibend</span>
                </button>
            ))}
          </div>

          {lockoutSeconds > 0 && (
              <p className="feedback error-feedback" role="alert">
                Gesperrt. Versuchen Sie es erneut in{' '}
                {Math.floor(lockoutSeconds / 60)}:
                {String(lockoutSeconds % 60).padStart(2, '0')}.
              </p>
          )}

          {answer !== null && !(locked && lockoutSeconds > 0) && (
              <>
                <p
                    className={
                      answer === 25
                          ? 'feedback success-feedback'
                          : 'feedback error-feedback'
                    }
                    role="alert"
                >
                  {answer === 25
                      ? 'Richtig. Es sind zwei 12-Stunden-Halbwertszeiten verstrichen, sodass noch 25 % übrig sind.'
                      : locked
                          ? `Diese Antwort ist nicht korrekt. Versuchen Sie es erneut in ${Math.floor(lockoutSeconds / 60)}:${String(lockoutSeconds % 60).padStart(2, '0')}.`
                          : 'Nicht ganz. Sie können jetzt einen neuen Versuch starten.'}
                </p>

                {answer === 25 && (
                    <a
                        className="download-button"
                        href={`${import.meta.env.BASE_URL}reports/sample-02-26-10-04/report-02.html`}
                    >
                      <BookOpenText size={17} />
                      Analysebericht ansehen
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

            <XAxis dataKey="x" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Area
                type="monotone"
                dataKey="y"
                stroke="none"
                fill="#3847d6"
                fillOpacity={0.16}
                isAnimationActive={false}
            />
            <Line
                type="monotone"
                dataKey="y"
                stroke="#3847d6"
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


  const [lockoutUntil, setLockoutUntil] = useState(() => {
    try {
      const saved = Number(
          localStorage.getItem(LOCKOUT_STORAGE_KEY)
      )

      return Number.isFinite(saved) && saved > Date.now()
          ? saved
          : 0
    } catch (error) {
      console.error('Could not read saved lockout:', error)
      return 0
    }
  })


  const [clockNow, setClockNow] = useState(Date.now())

  const lockoutSeconds = Math.max(
      0,
      Math.ceil((lockoutUntil - clockNow) / 1000)
  )

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

  function startLockout() {
    const until = Date.now() + 45 * 60 * 1000

    try {
      localStorage.setItem(LOCKOUT_STORAGE_KEY, String(until))
    } catch (error) {
      console.error('Could not save lockout:', error)
    }

    setClockNow(Date.now())
    setLockoutUntil(until)
  }

  function choose(index) {
    if (completed || lockoutSeconds > 0) return

    setAnswer(index)
    setAttempts(n => n + 1)

    if (index !== exp.correct) {
      startLockout()
    }
  }

  const standardCount = exp?.techniques?.length ?? exp?.standards?.length ?? 4
  function nextStandard() { setActiveStandard(i => (i + 1) % standardCount) }
  function prevStandard() { setActiveStandard(i => (i + standardCount - 1) % standardCount) }

  React.useEffect(() => {
    const onPop = () => {
      const id = Number(
          new URLSearchParams(window.location.search).get('experiment')
      )

      setSelectedId(EXPERIMENTS.some(e => e.id === id) ? id : null)
      setAnswer(null)
    }

    const id = Number(
        new URLSearchParams(window.location.search).get('experiment')
    )

    if (EXPERIMENTS.some(e => e.id === id)) {
      setSelectedId(id)
    }

    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  React.useEffect(() => {
    if (!lockoutUntil) return

    const timer = window.setInterval(() => {
      const now = Date.now()
      setClockNow(now)

      if (now >= lockoutUntil) {
        try {
          localStorage.removeItem(LOCKOUT_STORAGE_KEY)
        } catch (error) {
          console.error('Could not clear saved lockout:', error)
        }
        setLockoutUntil(0)
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [lockoutUntil])

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

              </div>


              <section className="experiment-section">
                <div className="section-heading">
                  <div>
                    <div className="section-kicker">IHR ARBEITSBEREICH</div>
                    <h2>Experiment auswählen</h2>
                  </div>
                  <span className="section-count">
                    {String(VISIBLE_EXPERIMENT_IDS.length).padStart(2, '0')} verfügbar <span>↗</span>
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
                          ) : item.id === 3 ? (
                              <NmrGraph
                                  src={item.nmrSampleGraphs[0]}
                                  overlaySrc={item.nmrSampleGraphs[1]}
                                  compact
                              />
                          ) : item.id === 4 || item.id === 5 ? (
                              <CsvGraph
                                  src={item.sampleGraph}
                                  overlaySrc={item.id === 5
                                      ? `${import.meta.env.BASE_URL}graphs/sample-05-26-10-04/FeS2.csv`
                                      : undefined}
                                  variant={i % 4}
                                  sample
                                  compact
                              />
                          ) : (
                              <Graph
                                  exp={item}
                                  variant={i % 4}
                                  sample={item.id === 2}
                                  compact
                              />
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
                <div className="progress-chip"><span className="progress-number">0{exp.id}</span><span className="progress-slash">/</span><span>05 experimenten</span></div>
              </div>

              {lockoutSeconds > 0 && (
                  <div className="lockout-notice" role="alert">
                    <strong>Pause erforderlich </strong>
                    <span>
                      Weitere Antworten sind vorübergehend gesperrt.
                      Verbleibende Zeit: {' '}
                      {Math.floor(lockoutSeconds / 60)}:
                      {String(lockoutSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
              )}

              {exp.id === 2 ? (
                  <Experiment2View
                      locked={lockoutSeconds > 0}
                      lockoutSeconds={lockoutSeconds}
                      onIncorrect={startLockout}
                  />
              ) : (
              <div className="comparison-layout">
                <section className="panel sample-panel">
                  <div className="panel-heading"><div><span className="panel-index">01</span><h2>Experimentelle Probe</h2></div><span className="sample-tag">Probe</span></div>
                  <p className="panel-description">
                    {exp.id === 4
                        ? 'HPLC-Chromatogramm des Schokoladenextrakts. Die Peaks zeigen die getrennten Substanzen.'
                        : 'Referenzkurve zum Vergleich mit den Standards.'}
                  </p>
                  <div className="sample-chart">

                    <div className="sample-chart">
                      {exp.id === 5 && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '16px',
                            marginBottom: '6px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            <span style={{ color: '#eab308' }}>Cocoa butter</span>
                            <span style={{ color: '#16a34a' }}>Unbekannt</span>
                          </div>
                      )}

                      {exp.id === 3 ? (
                          <NmrGraph
                              src={exp.nmrSampleGraphs[0]}
                              overlaySrc={exp.nmrSampleGraphs[1]}
                          />
                      ) : exp.id === 4 ? (
                          <CsvGraph
                              src={exp.sampleGraph}
                              variant={exp.correct}
                              sample
                          />
                      ) : exp.id === 5 ? (
                          <CsvGraph
                              src={exp.sampleGraph}
                              overlaySrc={`${import.meta.env.BASE_URL}graphs/sample-05-26-10-04/FeS2.csv`}
                              variant={exp.correct}
                              sample
                          />
                      ) : (
                          <Graph exp={exp} variant={exp.correct} sample />
                      )}
                    </div>

                  </div>
                  <div className="chart-axis-caption">
                    <span>
                      {exp.id === 3 ? 'CHEMICAL SHIFT / PPM' :
                          exp.id === 5 ? '2θ / DEGREES' :
                              exp.id === 4 ? 'RETENTION TIME / MIN' :
                                  exp.sampleGraph ? 'FRAGMENT SIZE / BP' : 'TIME / X'}
                    </span>
                    <span>
                      {exp.id === 3 ? 'SIGNAL INTENSITY / AU' :
                          exp.sampleGraph ? 'SIGNAL INTENSITY / AU' : 'RESPONSE / Y'}
                    </span>
                  </div>
                  <div className="sample-meta"><div><span>DATA POINTS</span><strong>{exp.sampleGraph ? 'CSV measurements' : '25 readings'}</strong></div><div><span>MEASUREMENT</span><strong>{exp.sampleGraph ? 'Signal intensity (AU)' : 'Normalized response'}</strong></div></div>
                  <div className="hint-box"><span className="hint-icon"><Sparkles size={16} /></span><p><strong>Suchen Sie nach der Beziehung.</strong> Konzentrieren Sie sich auf die Gesamtform, den Höhepunkt und die Änderungsrate der Kurve.</p></div>
                </section>

                <section className="panel standards-panel">
                  <div className="panel-heading">
                  <div>
                    <span className="panel-index">02</span>
                      <h2>
                        {exp.id === 4
                            ? 'Analytische Methode'
                            : exp.id === 5
                                ? 'XRD-Referenzspektren'
                                : 'Standardkurven'}
                      </h2>
                  </div>
                  <span className="standard-count">{standardCount} Optionen</span>
                </div>

                  <p className="panel-description">
                    {exp.id === 4
                        ? 'HPLC-Chromatogramm des Schokoladenextrakts.'
                        : exp.id === 5
                            ? 'Vergleichen Sie die Referenzspektren der fünf möglichen Substanzen.'
                            : 'Referenzkurve zum Vergleich mit den Standards.'}
                  </p>
                {exp.id !== 4 && (
                    <>
                    <div className="carousel">
                    <button className="carousel-arrow" onClick={prevStandard} aria-label="Previous standard"><ChevronLeft size={20} /></button>
                    <div className="standard-card">
                      <div className="standard-card-top"><span className="standard-label">STANDARD CURVE</span>
                        <span className="standard-position">0{activeStandard + 1}
                          <span>/ {String(standardCount).padStart(2, '0')}
                          </span>
                        </span>
                      </div>
                      <div className="standard-name-row"><div>
                        <span className="standard-dot" style={{ background: COLORS[activeStandard] }} />
                        <h3>
                          {exp.standardNames
                              ? exp.standardNames[activeStandard]
                              : `Standard ${String.fromCharCode(65 + activeStandard)}`}
                        </h3>
                      </div>
                        <span className="standard-code">REF-0{activeStandard + 1}</span>
                      </div>
                      <div className="standard-chart">
                        {exp.id === 3 ? (
                            <NmrGraph src={exp.standards[activeStandard]} />
                        ) : exp.id === 5 ? (
                            <CsvGraph
                                src={exp.standards[activeStandard]}
                                variant={activeStandard}
                            />
                        ) : (
                            <Graph exp={exp} variant={activeStandard} />
                        )}
                      </div>
                      <div className="chart-axis-caption">
                        <span>
                            {exp.id === 5 ? '2θ / DEGREES' :
                                exp.id === 3 ? 'CHEMICAL SHIFT / PPM' :
                                    exp.id === 4 ? 'RETENTION TIME / MIN' :
                                        exp.sampleGraph ? 'FRAGMENT SIZE / BP' : 'TIME / X'}
                        </span>
                        <span>SIGNAL INTENSITY / AU</span>
                      </div>
                      <div className="standard-card-bottom">
                        <span>Referenzdaten</span>
                        <span>{activeStandard + 1} of {standardCount}</span>
                      </div>
                    </div>
                    <button className="carousel-arrow" onClick={nextStandard} aria-label="Next standard">
                      <ChevronRight size={20} />
                    </button>
                  </div>

                      <div className="carousel-dots" aria-label="Select a standard">
                        {Array.from({ length: standardCount }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveStandard(i)}
                                className={`carousel-dot ${i === activeStandard ? 'active' : ''}`}
                                aria-label={`Show standard ${String.fromCharCode(65 + i)}`}
                            />
                        ))}
                      </div>
                </>
              )}

                  <div className="answer-area">
                    {completed ? (
                        <div className="success-state">
                          <div className="success-icon"><CheckCircle2 size={22} /></div>
                          <div className="success-copy">
                            <h3>{exp.id === 4 ? 'Richtige Methode ausgewählt' : 'Korrekte Übereinstimmung'}</h3>
                            <p>
                              {exp.id === 4
                                  ? 'Sie haben die geeignete Methode zur Identifizierung der getrennten Substanzen gewählt.'
                                  : 'SUPER! Sie haben die richtige Referenzprobe identifiziert.'}
                            </p>
                            {exp.reportPage ? (
                                <a className="download-button" href={exp.reportPage}>
                                  <BookOpenText size={17} />
                                  Analysebericht ansehen
                                  <ArrowRight size={15} />
                                </a>
                            ) : (
                                <a href={exp.report} target="_blank" rel="noopener noreferrer">
                                  Analysebericht ansehen
                                </a>
                            )}
                          </div>
                        </div>
                    ) : (
                        <>
                          <div className="answer-options">
                            {Array.from({ length: standardCount }, (_, i) => (
                                <button
                                    key={i}
                                    disabled={lockoutSeconds > 0}
                                    onClick={() => choose(i)}
                                    className={`answer-option ${
                                        answer === i
                                            ? (i === exp.correct ? 'answer-correct' : 'answer-wrong')
                                            : ''
                                    }`}
                                >
                                  <span className="answer-letter">
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                  <span>
{exp.techniques
    ? exp.techniques[i]
    : exp.standardNames
        ? exp.standardNames[i]
        : `Standard ${String.fromCharCode(65 + i)}`}
                                  </span>

                                  {answer === i && (
                                      i === exp.correct
                                          ? <CheckCircle2 size={17} />
                                          : <RotateCcw size={16} />
                                  )}

                                  {answer !== i && (
                                      <ArrowRight className="answer-arrow" size={15} />
                                  )}
                                </button>
                            ))}
                          </div>

                          {lockoutSeconds > 0 && (
                              <p className="feedback error-feedback" role="alert">
                                Gesperrt. Versuchen Sie es erneut in{' '}
                                {Math.floor(lockoutSeconds / 60)}:
                                {String(lockoutSeconds % 60).padStart(2, '0')}.
                              </p>
                          )}

                        </>
                    )}
                  </div>
                </section>
              </div>)}
              <footer className="workspace-footer">
                <span>ZENTRALLABOR / {exp.code}</span>
                <button onClick={goHome}>
                  Experiment beenden <ArrowRight size={13} />
                </button>
              </footer>
            </main>
        )}
      </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)

