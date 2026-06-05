import { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBrainData } from '../hooks/useBrainData';
import TopBar from '../components/TopBar';
import SliceViewer from '../components/SliceViewer';
import LoadingScreen from '../components/LoadingScreen';
import InfoPanel from '../components/InfoPanel';
import QAPanel from '../components/QAPanel';

const ConnectivityMatrix = lazy(() => import('../components/ConnectivityMatrix'));
const BrainGraph3D = lazy(() => import('../components/BrainGraph3D'));

const CARD_VIZ_HEIGHT = 580;

const CARD_TOOLTIPS = {
  connmap: (
    <>
      A 116×116 matrix of pairwise functional connectivity (Fisher-z Pearson correlations) between all brain parcels.
      <b style={{ color: '#1A1A18' }}> Warm colors</b> = positive correlation;
      <b style={{ color: '#1A1A18' }}> cool colors</b> = anticorrelation.
      Click any cell to inspect that parcel in the T1 Targets panel below.
      White lines separate functional networks; white crosshair marks the selected parcel.
    </>
  ),
  brain3d: (
    <>
      Brain parcels placed at their MNI coordinates on a glass cortical surface.
      <b style={{ color: '#1A1A18' }}> Red nodes</b> = DMN,{' '}
      <b style={{ color: '#1A1A18' }}> orange</b> = FPN.
      Drag to rotate, scroll to zoom. Click a node to select it.
      Use the network buttons in the header to isolate a network's connections.
    </>
  ),
  t1targets: (
    <>
      Structural MRI (T1-weighted) slices showing the selected parcel's anatomical location
      in axial, coronal, and sagittal planes, overlaid on the patient's own T1 scan.
      Select a parcel in the Connectivity Map or 3D Brain Explorer above to see its T1 position.
    </>
  ),
};

function VisualizationCard({ title, tooltip, children, vizHeight }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid #E0DDD5',
      background: '#FFFFFF',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid #E0DDD5',
        background: '#FAFAF8', flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18', letterSpacing: '0.01em' }}>
          {title}
        </span>
        <button
          onClick={() => setTooltipOpen(v => !v)}
          title="What is this?"
          style={{
            width: 22, height: 22, borderRadius: '50%',
            border: `1.5px solid ${tooltipOpen ? '#1A1A18' : '#B5B3AA'}`,
            background: tooltipOpen ? '#1A1A18' : 'transparent',
            color: tooltipOpen ? '#FFFFFF' : '#B5B3AA',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', flexShrink: 0,
          }}
        >?</button>
      </div>

      {/* Tooltip bar */}
      {tooltipOpen && (
        <div style={{
          padding: '10px 16px',
          background: '#F5F3EF',
          borderBottom: '1px solid #E0DDD5',
          fontSize: 12, color: '#6B6760', lineHeight: 1.65,
          flexShrink: 0,
        }}>
          {tooltip}
        </div>
      )}

      {/* Visualization area */}
      <div style={{
        position: 'relative',
        height: vizHeight ?? 'auto',
        flex: vizHeight ? undefined : 1,
      }}>
        {children}
      </div>
    </div>
  );
}

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const { data, loading, error } = useBrainData(subjectId);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [networkHighlight, setNetworkHighlight] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [showLinks, setShowLinks] = useState(false);
  const [showQA, setShowQA] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setSelectedParcel(null);
    setSelectedRow(null);
    setNetworkHighlight(null);
  }, [subjectId]);

  const selectedParcelObj = selectedParcel !== null
    ? data?.parcels?.[selectedParcel] ?? null
    : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F3EF' }}>
      <TopBar
        subjectId={subjectId}
        networkHighlight={networkHighlight}
        onHighlightChange={setNetworkHighlight}
        meta={data?.meta ?? null}
        showLinks={showLinks}
        onToggleLinks={() => setShowLinks(v => !v)}
        showQA={showQA}
        onToggleQA={() => setShowQA(v => !v)}
        onOpenInfo={() => setShowInfo(true)}
      />

      {showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}
      {showQA && <QAPanel subjectId={subjectId} onClose={() => setShowQA(false)} />}

      {loading && (
        <div style={{ flex: 1 }}>
          <LoadingScreen message={`Loading ${subjectId}…`} />
        </div>
      )}

      {error && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{
            maxWidth: 400, background: '#FFF5F5', border: '1px solid #FCA5A5',
            borderRadius: 12, padding: 24, textAlign: 'center',
          }}>
            <p style={{ color: '#DC2626', marginBottom: 16, fontSize: 14 }}>Failed to load data: {error}</p>
            <Link to="/" style={{ color: '#2563EB', fontSize: 13, textDecoration: 'none' }}>← Back to overview</Link>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {/* Row 1 — Connectivity Map (left) + 3D Brain Explorer (right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <VisualizationCard
              title="Connectivity Map"
              tooltip={CARD_TOOLTIPS.connmap}
              vizHeight={CARD_VIZ_HEIGHT}
            >
              <Suspense fallback={<LoadingScreen message="Loading matrix…" />}>
                <ConnectivityMatrix
                  data={data}
                  selectedParcel={selectedParcel}
                  selectedRow={selectedRow}
                  networkHighlight={networkHighlight}
                  onParcelSelect={(col, row) => { setSelectedParcel(col); setSelectedRow(row); }}
                  onEdgeHover={setHoveredEdge}
                />
              </Suspense>
            </VisualizationCard>

            <VisualizationCard
              title="3D Brain Explorer"
              tooltip={CARD_TOOLTIPS.brain3d}
              vizHeight={CARD_VIZ_HEIGHT}
            >
              <Suspense fallback={<LoadingScreen message="Loading 3D graph…" />}>
                <BrainGraph3D
                  data={data}
                  selectedParcel={selectedParcel}
                  networkHighlight={networkHighlight}
                  hoveredEdge={hoveredEdge}
                  showLinks={showLinks}
                  onParcelSelect={parcel => { setSelectedParcel(parcel); setSelectedRow(parcel); }}
                />
              </Suspense>
            </VisualizationCard>
          </div>

          {/* Row 2 — T1 Targets */}
          <VisualizationCard
            title="T1 Targets"
            tooltip={CARD_TOOLTIPS.t1targets}
          >
            {selectedParcelObj ? (
              <SliceViewer
                parcel={selectedParcelObj}
                subjectId={subjectId}
                onClose={() => setSelectedParcel(null)}
              />
            ) : (
              <div style={{
                padding: '44px 24px', textAlign: 'center',
                color: '#B5B3AA', fontSize: 13,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.5 }}>
                  <circle cx="16" cy="16" r="11" stroke="#B5B3AA" strokeWidth="1.5" />
                  <circle cx="16" cy="16" r="4" stroke="#B5B3AA" strokeWidth="1.5" />
                  <line x1="16" y1="2" x2="16" y2="7" stroke="#B5B3AA" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="25" x2="16" y2="30" stroke="#B5B3AA" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="16" x2="7" y2="16" stroke="#B5B3AA" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="25" y1="16" x2="30" y2="16" stroke="#B5B3AA" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Click a parcel in the Connectivity Map or 3D Brain Explorer to view its T1 structural location</span>
              </div>
            )}
          </VisualizationCard>
        </main>
      )}
    </div>
  );
}
