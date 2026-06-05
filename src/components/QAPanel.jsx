import { useState } from 'react';
import { HF_BASE } from '../utils/hf';

const QA_IMAGES = [
  {
    file: 'qa_1_bold_t1_coreg.png',
    title: '#1 — BOLD → T1 Coregistration',
    desc: 'Red contour = BOLD brain boundary overlaid on T1 structural image. The red outline should tightly follow the T1 brain surface. Misalignment indicates the rigid BOLD→T1 coregistration failed.',
  },
  {
    file: 'qa_2_t1_mni.png',
    title: '#2 — T1 → MNI Normalisation',
    desc: 'Green contour = T1-in-MNI brain boundary overlaid on the MNI152 template. The green outline should closely follow the MNI brain surface. Misalignment indicates the SyN T1→MNI warping failed.',
  },
  {
    file: 'qa_3_atlas_bold.png',
    title: '#3 — Atlas Alignment in BOLD Space',
    desc: 'Coloured parcels (atlas) overlaid on BOLD mean image. Parcels should tile the cortex visible in the BOLD field of view. If parcels miss the brain, the atlas→BOLD inverse warp failed.',
  },
  {
    file: 'qa_4_atlas_t1mni.png',
    title: '#4 — Atlas on T1-in-MNI (Slice Reference)',
    desc: 'Coloured parcels overlaid on T1-in-MNI. Parcels should tile the full cortex on the MNI T1. This is the reference space used for generating all per-parcel slice images.',
  },
];

export default function QAPanel({ subjectId, onClose }) {
  const [errors, setErrors] = useState({});

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(26,26,24,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF', border: '1px solid #E0DDD5', borderRadius: 14,
          padding: '20px 24px', maxWidth: 920, width: '100%', maxHeight: '90vh',
          overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ color: '#1A1A18', fontSize: 15, fontWeight: 700, margin: 0 }}>
            QA Images — {subjectId}
          </h2>
          <button
            onClick={onClose}
            style={{ color: '#B5B3AA', fontSize: 22, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          >×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
          {QA_IMAGES.map(({ file, title, desc }) => {
            const url = `${HF_BASE}/${subjectId}/qa/${file}`;
            return (
              <div key={file} style={{
                background: '#F5F3EF', border: '1px solid #E0DDD5',
                borderRadius: 10, overflow: 'hidden',
              }}>
                {errors[file] ? (
                  <div style={{
                    height: 160, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#B5B3AA', fontSize: 13,
                  }}>
                    Image not available
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={title}
                    style={{ width: '100%', display: 'block' }}
                    onError={() => setErrors(e => ({ ...e, [file]: true }))}
                    loading="lazy"
                  />
                )}
                <div style={{ padding: '10px 14px' }}>
                  <p style={{ color: '#1A1A18', fontSize: 12, fontWeight: 700, margin: '0 0 4px 0' }}>{title}</p>
                  <p style={{ color: '#9B9890', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
