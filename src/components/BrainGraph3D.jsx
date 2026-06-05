import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { networkColor } from '../utils/networkColors';
import { getParcelLabel } from '../utils/parcelLabels';



export default function BrainGraph3D({ data, selectedParcel, networkHighlight, hoveredEdge, showLinks, onParcelSelect }) {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const cameraInitRef = useRef(false);

  // Track container size so the canvas fills its parent exactly
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const graphData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };

    const nodes = data.parcels.map((p, i) => ({
      id: p.id ?? i,
      name: getParcelLabel(p),
      network: p.network,
      fx: p.mni_xyz[0],
      fy: p.mni_xyz[1],
      fz: p.mni_xyz[2],
      x: p.mni_xyz[0],
      y: p.mni_xyz[1],
      z: p.mni_xyz[2],
    }));

    // Center nodes at their centroid so OrbitControls rotates around the brain
    const n = nodes.length;
    const cx = nodes.reduce((s, nd) => s + nd.fx, 0) / n;
    const cy = nodes.reduce((s, nd) => s + nd.fy, 0) / n;
    const cz = nodes.reduce((s, nd) => s + nd.fz, 0) / n;
    nodes.forEach(nd => {
      nd.fx -= cx; nd.x = nd.fx;
      nd.fy -= cy; nd.y = nd.fy;
      nd.fz -= cz; nd.z = nd.fz;
    });

    const links = data.edges
      .filter(e => Math.abs(e.weight) > 0.3)
      .map(e => ({ source: e.source, target: e.target, weight: e.weight }));

    return { nodes, links };
  }, [data]);

  // Reset init flag when data changes so camera re-centers on new subject
  useEffect(() => { cameraInitRef.current = false; }, [data]);

  // Glass brain surface (fsaverage5 pial, both hemispheres, pre-centered to match nodes).
  // Depends on dims.w so it runs only after ForceGraph3D has mounted and fgRef is valid.
  useEffect(() => {
    if (!fgRef.current || !data || dims.w === 0) return;
    const scene = fgRef.current.scene();

    // Remove stale surface from a previous subject load
    const old = scene.getObjectByName('brain-surface');
    if (old) {
      old.traverse(c => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
      scene.remove(old);
    }

    let cancelled = false;
    let surfaceGroup = null;

    const glassMat = new THREE.MeshPhongMaterial({
      color: 0xbbddff,
      transparent: true,
      opacity: 0.09,
      side: THREE.DoubleSide,
      depthWrite: false,
      shininess: 80,
      specular: new THREE.Color(0x5599cc),
    });

    new OBJLoader().load('/brain_surface.obj', obj => {
      if (cancelled) return;
      obj.name = 'brain-surface';
      obj.traverse(child => {
        if (child.isMesh) {
          child.geometry.computeVertexNormals();
          child.material = glassMat;
        }
      });
      scene.add(obj);
      surfaceGroup = obj;
    });

    return () => {
      cancelled = true;
      if (surfaceGroup) {
        surfaceGroup.traverse(c => { if (c.isMesh) c.geometry.dispose(); });
        scene.remove(surfaceGroup);
      }
      glassMat.dispose();
    };
  }, [data, dims.w]); // eslint-disable-line react-hooks/exhaustive-deps

  // DMN (Default), FPN (Cont) and DAN (DorsAttn) always show their network color; all others are dark grey
  const FEATURED_NETWORKS = new Set(['Default', 'Cont', 'DorsAttn']);
  const DARK_GREY = '#2d3a4a';

  function resolveNodeColor(parcel, highlightedIds, isHovered) {
    if (isHovered) return '#ffffff';
    if (highlightedIds) {
      // Network highlight mode: highlighted parcels → network color, rest → near-invisible
      return highlightedIds.has(parcel.id ?? data.parcels.indexOf(parcel))
        ? networkColor(parcel.network)
        : null; // null means dim
    }
    // Default mode: only DMN + FPN keep their color
    return FEATURED_NETWORKS.has(parcel.network) ? networkColor(parcel.network) : DARK_GREY;
  }

  // Update node materials/sizes when interactive state changes without rebuilding geometries
  useEffect(() => {
    if (!fgRef.current || !data) return;
    const scene = fgRef.current.scene();

    const highlightedIds = networkHighlight
      ? new Set(data.network_index[networkHighlight] ?? [])
      : null;
    const hoveredIds = hoveredEdge
      ? new Set([hoveredEdge.source, hoveredEdge.target])
      : null;

    scene.traverse(obj => {
      if (obj.userData.nodeId === undefined || !obj.material) return;
      const nodeId = obj.userData.nodeId;
      const parcel = data.parcels[nodeId];
      if (!parcel) return;

      const isHovered = hoveredIds?.has(nodeId) ?? false;
      const isSelected = nodeId === selectedParcel;
      obj.scale.setScalar(isSelected || isHovered ? 1.8 : 1);

      const color = resolveNodeColor(parcel, highlightedIds, isHovered);
      if (color === null) {
        obj.material.color.set(DARK_GREY);
        obj.material.opacity = 0.07;
      } else {
        obj.material.color.set(color);
        obj.material.opacity = 1;
      }
      obj.material.needsUpdate = true;
    });
  }, [selectedParcel, networkHighlight, hoveredEdge, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build node objects once per data change; scene traversal handles dynamic updates
  const nodeThreeObject = useCallback((node) => {
    const isFeatured = ['Default', 'Cont', 'DorsAttn'].includes(node.network);
    const geo = new THREE.SphereGeometry(3, 8, 8);
    const mat = new THREE.MeshLambertMaterial({
      color: isFeatured ? networkColor(node.network) : DARK_GREY,
      transparent: true,
      opacity: 1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.nodeId = node.id;
    return mesh;
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return null;

  const highlightedIds = networkHighlight
    ? new Set(data.network_index[networkHighlight] ?? [])
    : null;

  const LINK_COLOR = '255,160,180';

  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }

  function linkColor(link) {
    const src = typeof link.source === 'object' ? link.source.id : link.source;
    const tgt = typeof link.target === 'object' ? link.target.id : link.target;

    // Hovered edge → bright white
    if (hoveredEdge) {
      if ((src === hoveredEdge.source && tgt === hoveredEdge.target) ||
          (src === hoveredEdge.target && tgt === hoveredEdge.source)) {
        return '#ffffff';
      }
    }

    if (highlightedIds) {
      if (!highlightedIds.has(src) || !highlightedIds.has(tgt)) {
        return 'rgba(100,116,139,0.04)';
      }
      // Both endpoints in highlighted network → use that network's color
      const w = link.weight;
      const opacity = Math.min(Math.abs(w), 1) * 0.75;
      const rgb = hexToRgb(networkColor(networkHighlight));
      return `rgba(${rgb},${opacity.toFixed(3)})`;
    }

    const w = link.weight;
    if (!showLinks) return 'rgba(0,0,0,0)';
    const opacity = Math.min(Math.abs(w), 1) * 0.05;
    return `rgba(${LINK_COLOR},${opacity.toFixed(3)})`;
  }

  function linkWidth(link) {
    const src = typeof link.source === 'object' ? link.source.id : link.source;
    const tgt = typeof link.target === 'object' ? link.target.id : link.target;
    if (hoveredEdge &&
        ((src === hoveredEdge.source && tgt === hoveredEdge.target) ||
         (src === hoveredEdge.target && tgt === hoveredEdge.source))) {
      return 3;
    }
    return Math.abs(link.weight) * 1.5;
  }

  const activeLinkColor = highlightedIds
    ? networkColor(networkHighlight)
    : `rgb(${LINK_COLOR})`;

  const LEGEND = [
    { color: '#E84040', label: 'DMN',   desc: 'Default Mode Network' },
    { color: '#F28500', label: 'FPN',   desc: 'Frontoparietal Network' },
    { color: '#22C55E', label: 'DAN',   desc: 'Dorsal Attention Network' },
    { color: '#2d3a4a', label: 'Other', desc: 'Other networks', border: '#4b5a6e' },
    { color: activeLinkColor, label: '—', desc: 'Functional connection', isLine: true },
  ];

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {dims.w > 0 && (
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          backgroundColor="#0a0a0f"
          nodeThreeObject={nodeThreeObject}
          nodeThreeObjectExtend={false}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkOpacity={1}
          enableNodeDrag={false}
          onNodeClick={node => onParcelSelect(node.id)}
          cooldownTicks={0}
          width={dims.w}
          height={dims.h}
          onEngineStop={() => {
            if (fgRef.current && !cameraInitRef.current) {
              fgRef.current.cameraPosition(
                { x: 0, y: 0, z: 280 },
                { x: 0, y: 0, z: 0 },
                0,
              );
              cameraInitRef.current = true;
            }
          }}
        />
      )}

      {/* Legend overlay */}
      <div style={{
        position: 'absolute', bottom: 14, left: 12,
        background: 'rgba(8,8,14,0.78)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
        padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5,
        pointerEvents: 'none',
      }}>
        {LEGEND.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.isLine ? (
              <div style={{ width: 18, height: 2, borderRadius: 1, background: item.color, opacity: 0.9, flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                background: item.color,
                border: item.border ? `1px solid ${item.border}` : 'none',
              }} />
            )}
            <span style={{ fontSize: 10, color: '#8892a0', whiteSpace: 'nowrap' }}>
              <span style={{ color: item.color, fontWeight: 600 }}>{item.label}</span>
              {' — '}
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
