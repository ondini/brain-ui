import { useManifest } from '../hooks/useManifest';
import SubjectCard from '../components/SubjectCard';
import TopBar from '../components/TopBar';
import LoadingScreen from '../components/LoadingScreen';

export default function SubjectOverview() {
  const { manifest, loading, error, retry } = useManifest();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F3EF' }}>
      <TopBar subjectId={null} />

      <main style={{ flex: 1, padding: '36px 24px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {loading && <LoadingScreen message="Loading subjects…" />}

        {error && (
          <div style={{
            maxWidth: 400, margin: '48px auto 0',
            background: '#FFF5F5', border: '1px solid #FCA5A5',
            borderRadius: 12, padding: 24, textAlign: 'center',
          }}>
            <p style={{ color: '#DC2626', marginBottom: 16, fontSize: 14 }}>Failed to load manifest: {error}</p>
            <button
              onClick={retry}
              style={{
                padding: '7px 20px', background: '#FFFFFF',
                border: '1px solid #FCA5A5', color: '#DC2626',
                borderRadius: 7, cursor: 'pointer', fontSize: 13,
              }}
            >Retry</button>
          </div>
        )}

        {!loading && !error && manifest && (
          <>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A18', margin: '0 0 6px 0' }}>
                Subject Overview
              </h1>
              <p style={{ fontSize: 13, color: '#9B9890', margin: 0 }}>
                {manifest.subjects.length} subject{manifest.subjects.length !== 1 ? 's' : ''} processed
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {manifest.subjects.map(subject => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer style={{
        borderTop: '1px solid #E0DDD5', padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#FFFFFF',
      }}>
        <img src="/tiesa-logo-dark.svg" alt="Tiesa" style={{ height: 18, opacity: 0.6 }} />
        <span style={{ fontSize: 11, color: '#C5C2BA' }}>Brain Connectivity Explorer</span>
      </footer>
    </div>
  );
}
