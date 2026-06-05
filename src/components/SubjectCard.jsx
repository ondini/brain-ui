import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const METRIC_INFO = {
  DMN: {
    label: 'DMN',
    description: 'Default Mode Network — internal thought & self-referential processing',
    color: '#E84040',
  },
  FPN: {
    label: 'FPN',
    description: 'Frontoparietal Network — executive control & working memory',
    color: '#F28500',
  },
  DAN: {
    label: 'DAN',
    description: 'Dorsal Attention Network — top-down spatial attention & goal-directed perception',
    color: '#22C55E',
  },
  anticorrelation: {
    label: 'DMN↔FPN',
    description: 'Anticorrelation between the two networks — more negative = better network segregation',
  },
};

function MetricRow({ info, value }) {
  const color = info.color ?? (value < 0 ? '#E84040' : '#9B9890');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#6B6760', fontWeight: 500 }}>{info.label}</span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color }}>
          {typeof value === 'number' ? value.toFixed(3) : '—'}
        </span>
      </div>
      <p style={{ fontSize: 10, color: '#B5B3AA', lineHeight: 1.4, margin: 0 }}>{info.description}</p>
    </div>
  );
}

export default function SubjectCard({ subject }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(`/${subject.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${hovered ? '#1A1A18' : '#E0DDD5'}`,
        borderRadius: 12,
        padding: '18px 20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'border-color 0.18s, box-shadow 0.18s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontWeight: 600, color: '#1A1A18', margin: 0, fontSize: 15 }}>
          {subject.name ?? subject.id}
        </h3>
        <span style={{ fontSize: 11, color: '#B5B3AA' }}>
          {subject.processed_at
            ? new Date(subject.processed_at).toLocaleDateString()
            : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <MetricRow info={METRIC_INFO.DMN} value={subject.dmn_connectivity} />
        <MetricRow info={METRIC_INFO.FPN} value={subject.fpn_connectivity} />
        <MetricRow info={METRIC_INFO.DAN} value={subject.dan_connectivity} />
        <MetricRow info={METRIC_INFO.anticorrelation} value={subject.dmn_fpn_anticorrelation} />
      </div>

      <div style={{
        marginTop: 4, width: '100%', textAlign: 'center', fontSize: 12,
        color: hovered ? '#1A1A18' : '#9B9890',
        border: `1px solid ${hovered ? '#1A1A18' : '#E0DDD5'}`,
        borderRadius: 6, padding: '5px 0',
        transition: 'color 0.18s, border-color 0.18s',
      }}>
        View →
      </div>
    </div>
  );
}
