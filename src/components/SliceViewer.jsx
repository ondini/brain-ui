import { useState } from 'react';
import { HF_BASE } from '../utils/hf';
import { networkColor } from '../utils/networkColors';

export default function SliceViewer({ parcel, subjectId, onClose }) {
  const [imgError, setImgError] = useState(false);

  if (!parcel) return null;

  const idx = String(parcel.id).padStart(3, '0');
  const imgUrl = parcel.slice_image_url
    ?? `${HF_BASE}/${subjectId}/slices/parcel_${idx}.png`;

  const color = networkColor(parcel.network);

  return (
    <div style={{ padding: '16px 20px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Meta column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', margin: 0 }}>
            {parcel.label ?? parcel.name}
          </h4>
          <button
            onClick={onClose}
            style={{
              color: '#B5B3AA', fontSize: 20, lineHeight: 1, background: 'none',
              border: 'none', cursor: 'pointer', marginLeft: 8, padding: 0,
            }}
          >×</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 4,
            fontWeight: 600, background: color + '18', color,
          }}>
            {parcel.network}
          </span>
          {parcel.hemisphere !== 'B' && (
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: '#F5F3EF', color: '#6B6760',
            }}>
              {parcel.hemisphere === 'L' ? 'Left' : 'Right'}
            </span>
          )}
          {parcel.is_subcortical && (
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: '#F5F3EF', color: '#6B6760',
            }}>
              Subcortical
            </span>
          )}
        </div>

        <p style={{ fontSize: 11, color: '#9B9890', fontFamily: 'monospace', margin: 0 }}>
          MNI [{parcel.mni_xyz?.map(v => v.toFixed(1)).join(', ')}]
        </p>
        {parcel.t1_xyz && (
          <p style={{ fontSize: 11, color: '#B5B3AA', fontFamily: 'monospace', margin: 0 }}>
            T1 [{parcel.t1_xyz.map(v => v.toFixed(1)).join(', ')}]
          </p>
        )}
      </div>

      {/* Image */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {imgError ? (
          <div style={{
            height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F5F3EF', borderRadius: 8, color: '#9B9890', fontSize: 13,
          }}>
            {parcel.label ?? parcel.name} — no preview
          </div>
        ) : (
          <img
            src={imgUrl}
            alt={`Slice for ${parcel.name}`}
            style={{ width: '100%', borderRadius: 8, display: 'block' }}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
