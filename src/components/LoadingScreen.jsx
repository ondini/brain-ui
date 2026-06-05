export default function LoadingScreen({ message = 'Loading…', fullscreen = false }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: fullscreen ? '100vh' : '100%', minHeight: 200,
      background: 'transparent',
    }}>
      <div
        className="tiesa-spinner"
        style={{
          width: 28, height: 28, marginBottom: 12,
          border: '2px solid #E0DDD5', borderTopColor: '#1A1A18',
          borderRadius: '50%',
        }}
      />
      <p style={{ color: '#9B9890', fontSize: 13, margin: 0 }}>{message}</p>
    </div>
  );
}
