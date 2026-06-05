export default function InfoPanel({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(26,26,24,0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF', border: '1px solid #E0DDD5', borderRadius: 14,
          padding: '24px 28px', maxWidth: 640, width: '100%', maxHeight: '85vh',
          overflowY: 'auto', color: '#6B6760',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#1A1A18', fontSize: 16, fontWeight: 700, margin: 0 }}>
            Brain Connectivity Explorer — Guide
          </h2>
          <button
            onClick={onClose}
            style={{ color: '#B5B3AA', fontSize: 22, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          >×</button>
        </div>

        <Section title="Connectivity Metrics">
          <Metric color="#E84040" label="DMN" desc="Default Mode Network intra-network mean Fisher-z correlation. High values = stronger DMN synchrony at rest." />
          <Metric color="#F28500" label="FPN" desc="Frontoparietal (Control) Network intra-network mean Fisher-z. High values = stronger executive control network." />
          <Metric color="#22C55E" label="DAN" desc="Dorsal Attention Network intra-network mean Fisher-z. Reflects visuospatial attention system integrity." />
          <Metric color="#9B9890" label="DMN↔FPN" desc="Mean cross-network z-correlation between DMN and FPN. Negative = healthy anticorrelation (task-positive vs default)." />
        </Section>

        <Section title="Networks (Yeo 7-Network Parcellation)">
          <NetRow color="#E84040" name="DMN — Default Mode" desc="Medial prefrontal, posterior cingulate, angular gyri. Active during mind-wandering, self-referential thought." />
          <NetRow color="#F28500" name="FPN — Frontoparietal (Control)" desc="Lateral prefrontal, parietal cortex. Goal-directed cognition, working memory, cognitive control." />
          <NetRow color="#22C55E" name="DAN — Dorsal Attention" desc="Intraparietal sulcus, frontal eye fields. Top-down visuospatial attention." />
          <NetRow color="#9B59B6" name="SalVentAttn — Salience / Ventral Attention" desc="Anterior insula, anterior cingulate, inferior frontal. Detects salient stimuli, switching between networks." />
          <NetRow color="#3498DB" name="SomMot — Somatomotor" desc="Primary motor and somatosensory cortex, SMA. Sensory-motor integration." />
          <NetRow color="#8E44AD" name="Vis — Visual" desc="Occipital cortex (V1–V4), lateral occipital. Primary and higher visual processing." />
          <NetRow color="#D4A843" name="Limbic" desc="Orbitofrontal cortex, temporal poles. Emotional processing, memory, olfaction." />
        </Section>

        <Section title="How to Use">
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.85, fontSize: 13 }}>
            <li><b style={{ color: '#1A1A18' }}>Network buttons (DMN / FPN / DAN)</b> — highlight all parcels and connections in that network. Click again to deselect.</li>
            <li><b style={{ color: '#1A1A18' }}>Click a parcel</b> in the matrix or 3D graph — opens the T1 Targets card showing that parcel's location on the structural MRI.</li>
            <li><b style={{ color: '#1A1A18' }}>Hover on the matrix</b> — shows parcel names and Fisher-z connectivity score for that cell.</li>
            <li><b style={{ color: '#1A1A18' }}>Links ●/○ button</b> — toggle background connection edges in the 3D graph.</li>
            <li><b style={{ color: '#1A1A18' }}>QA button</b> — inspect registration quality images to verify pipeline alignment.</li>
            <li><b style={{ color: '#1A1A18' }}>? buttons</b> on each card — brief explanation of what that visualization shows.</li>
          </ul>
        </Section>

        <Section title="Connectivity Matrix">
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>
            The matrix shows pairwise Fisher-z transformed Pearson correlations between all 116 parcel timeseries (100 cortical Schaefer + 16 Melbourne subcortical). Values near{' '}
            <span style={{ color: '#ef4444' }}>+1</span> = strong positive correlation; near{' '}
            <span style={{ color: '#3b82f6' }}>−1</span> = anticorrelation. Diagonal is zeroed. White lines separate networks; white crosshair marks the selected parcel.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{
        color: '#9B9890', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', margin: '0 0 10px 0',
        borderBottom: '1px solid #E0DDD5', paddingBottom: 6,
      }}>{title}</h3>
      {children}
    </div>
  );
}

function Metric({ color, label, desc }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 9, alignItems: 'flex-start' }}>
      <span style={{
        background: color + '18', color, fontSize: 11, fontWeight: 700,
        padding: '2px 7px', borderRadius: 4, flexShrink: 0, fontFamily: 'monospace',
        border: `1px solid ${color}30`,
      }}>{label}</span>
      <span style={{ fontSize: 13, lineHeight: 1.6, color: '#6B6760' }}>{desc}</span>
    </div>
  );
}

function NetRow({ color, name, desc }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <span style={{ color, fontWeight: 600 }}>{name}</span>
        <span style={{ color: '#9B9890' }}> — {desc}</span>
      </div>
    </div>
  );
}
