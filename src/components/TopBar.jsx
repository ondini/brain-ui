import { Link } from 'react-router-dom';

function Pill({ label, value, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 5, fontSize: 11,
      fontFamily: 'monospace', fontWeight: 700,
      background: color + '18', color, border: `1px solid ${color}40`,
    }}>
      {label} {typeof value === 'number' ? value.toFixed(3) : value}
    </span>
  );
}

export default function TopBar({
  subjectId, networkHighlight, onHighlightChange,
  meta, showLinks, onToggleLinks, showQA, onToggleQA, onOpenInfo,
}) {
  const networkBtns = [
    { label: 'DMN', value: 'Default',  color: '#E84040' },
    { label: 'FPN', value: 'Cont',     color: '#F28500' },
    { label: 'DAN', value: 'DorsAttn', color: '#22C55E' },
    { label: '—',   value: null,       color: '#B5B3AA' },
  ];

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px',
      height: 56, background: '#FFFFFF', borderBottom: '1px solid #E0DDD5',
      flexShrink: 0, flexWrap: 'wrap', boxShadow: '0 1px 0 #E0DDD5',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
        <img src="/tiesa-logo-dark.svg" alt="Tiesa" style={{ height: 26 }} />
      </Link>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: '#E0DDD5', flexShrink: 0 }} />

      {/* Page title / breadcrumb */}
      {!subjectId && (
        <span style={{ color: '#6B6760', fontSize: 13 }}>Brain Connectivity Explorer</span>
      )}
      {subjectId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9B9890' }}>
          <Link to="/" style={{ color: '#6B6760', textDecoration: 'none' }}>Explorer</Link>
          <span>›</span>
          <span style={{ color: '#1A1A18', fontFamily: 'monospace', fontWeight: 500 }}>{subjectId}</span>
        </div>
      )}

      {/* Right-side controls */}
      {subjectId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {meta && (
            <div style={{ display: 'flex', gap: 5, marginRight: 6 }}>
              <Pill label="DMN" value={meta.dmn_connectivity} color="#E84040" />
              <Pill label="FPN" value={meta.fpn_connectivity} color="#F28500" />
              <Pill label="DAN" value={meta.dan_connectivity} color="#22C55E" />
              <Pill
                label="DMN↔FPN"
                value={meta.dmn_fpn_anticorrelation}
                color={meta.dmn_fpn_anticorrelation < 0 ? '#E84040' : '#9B9890'}
              />
            </div>
          )}

          {/* Network highlight buttons */}
          <div style={{ display: 'flex', gap: 3 }}>
            {networkBtns.map(b => (
              <button
                key={String(b.value)}
                onClick={() => onHighlightChange(networkHighlight === b.value ? null : b.value)}
                style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${networkHighlight === b.value ? b.color : '#DDD9D1'}`,
                  background: networkHighlight === b.value ? b.color + '1A' : '#FFFFFF',
                  color: networkHighlight === b.value ? b.color : '#9B9890',
                  transition: 'all 0.15s',
                }}
              >{b.label}</button>
            ))}

            {onToggleLinks != null && (
              <button
                onClick={onToggleLinks}
                style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', marginLeft: 2,
                  border: `1px solid ${showLinks ? '#93C5FD' : '#DDD9D1'}`,
                  background: showLinks ? '#EFF6FF' : '#FFFFFF',
                  color: showLinks ? '#2563EB' : '#9B9890',
                  transition: 'all 0.15s',
                }}
              >{showLinks ? 'Links ●' : 'Links ○'}</button>
            )}

            {onToggleQA != null && (
              <button
                onClick={onToggleQA}
                style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${showQA ? '#C4B5FD' : '#DDD9D1'}`,
                  background: showQA ? '#F5F3FF' : '#FFFFFF',
                  color: showQA ? '#7C3AED' : '#9B9890',
                  transition: 'all 0.15s',
                }}
              >QA</button>
            )}

            {onOpenInfo && (
              <button
                onClick={onOpenInfo}
                title="Help & explanations"
                style={{
                  width: 26, height: 26, borderRadius: '50%',
                  border: '1.5px solid #B5B3AA', background: 'transparent',
                  color: '#B5B3AA', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >?</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
