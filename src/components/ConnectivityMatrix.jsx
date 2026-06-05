import { useEffect, useRef, useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import { networkColor } from '../utils/networkColors';
import { getParcelLabel } from '../utils/parcelLabels';

// Shapes for the full 116×116 matrix view
function buildFullShapes(data, selectedParcel, selectedRow) {
  const { parcels, network_index, connectivity_matrix } = data;
  const n = connectivity_matrix.length;
  const shapes = [];

  const netOrder = [...new Set(parcels.map(p => p.network))];
  let pos = 0;
  for (const net of netOrder) {
    const count = (network_index[net] ?? []).length;
    if (pos > 0) {
      const b = pos - 0.5;
      shapes.push(
        { type: 'line', x0: b, y0: -0.5, x1: b, y1: n - 0.5, line: { color: 'rgba(0,0,0,0.25)', width: 1 } },
        { type: 'line', x0: -0.5, y0: b, x1: n - 0.5, y1: b, line: { color: 'rgba(0,0,0,0.25)', width: 1 } },
      );
    }
    pos += count;
  }

  if (selectedParcel !== null) {
    const row = selectedRow ?? selectedParcel;
    shapes.push(
      { type: 'line', x0: selectedParcel, y0: -0.5, x1: selectedParcel, y1: n - 0.5, line: { color: '#1A1A18', width: 1.5 } },
      { type: 'line', x0: -0.5, y0: row, x1: n - 0.5, y1: row, line: { color: '#1A1A18', width: 1.5 } },
    );
  }
  return shapes;
}

// Crosshair shapes for the filtered sub-matrix view
function buildFilteredShapes(filteredIds, selectedParcel, selectedRow) {
  const n = filteredIds.length;
  if (selectedParcel === null) return [];
  const colIdx = filteredIds.indexOf(selectedParcel);
  if (colIdx === -1) return [];
  const rowGlobal = selectedRow ?? selectedParcel;
  const rowIdx = filteredIds.indexOf(rowGlobal);
  const rowPos = rowIdx !== -1 ? rowIdx : colIdx;
  return [
    { type: 'line', x0: colIdx, y0: -0.5, x1: colIdx, y1: n - 0.5, line: { color: '#1A1A18', width: 1.5 } },
    { type: 'line', x0: -0.5, y0: rowPos, x1: n - 0.5, y1: rowPos, line: { color: '#1A1A18', width: 1.5 } },
  ];
}

export default function ConnectivityMatrix({ data, selectedParcel, selectedRow, networkHighlight, onParcelSelect, onEdgeHover }) {
  const divRef = useRef(null);
  const initializedRef = useRef(false);

  // Sub-matrix for the highlighted network
  const filtered = useMemo(() => {
    if (!data || !networkHighlight || !data.network_index[networkHighlight]) return null;
    const ids = data.network_index[networkHighlight];
    return {
      ids,
      subMatrix: ids.map(i => ids.map(j => data.connectivity_matrix[i][j])),
      subParcels: ids.map(i => data.parcels[i]),
    };
  }, [data, networkHighlight]);

  const displayMatrix = filtered ? filtered.subMatrix : data?.connectivity_matrix;
  const displayParcels = filtered ? filtered.subParcels : data?.parcels;

  // Full re-init when data source or filter changes
  useEffect(() => {
    if (!divRef.current || !data || !displayMatrix || !displayParcels) return;

    const n = displayMatrix.length;
    const shapes = filtered
      ? buildFilteredShapes(filtered.ids, selectedParcel, selectedRow)
      : buildFullShapes(data, selectedParcel, selectedRow);

    const networkHighlightColor = networkHighlight ? networkColor(networkHighlight) : null;

    Plotly.newPlot(divRef.current, [{
      type: 'heatmap',
      z: displayMatrix,
      colorscale: 'RdBu',
      reversescale: false,
      zmin: -1,
      zmax: 1,
      showscale: true,
      colorbar: { thickness: 10, len: 0.6, tickfont: { color: '#6B6760', size: 9 }, bgcolor: 'transparent' },
      hovertemplate: '%{customdata[0]}<br>× %{customdata[1]}<br>z = %{z:.3f}<extra></extra>',
      customdata: displayMatrix.map((row, i) =>
        row.map((_, j) => [
          displayParcels[i] ? getParcelLabel(displayParcels[i]) : String(i),
          displayParcels[j] ? getParcelLabel(displayParcels[j]) : String(j),
        ])
      ),
    }], {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { t: filtered ? 28 : 10, r: 40, b: 20, l: 20 },
      title: filtered
        ? { text: `${networkHighlight} network (${n} parcels)`, font: { color: networkHighlightColor, size: 12 }, x: 0.5, xanchor: 'center', y: 0.99, yanchor: 'top' }
        : undefined,
      xaxis: { showticklabels: false, showgrid: false, zeroline: false },
      yaxis: { showticklabels: false, showgrid: false, zeroline: false, autorange: 'reversed' },
      shapes,
      dragmode: false,
    }, {
      displayModeBar: false,
      responsive: true,
    });

    divRef.current.on('plotly_click', e => {
      if (!e.points?.[0]) return;
      const xi = e.points[0].x;
      const yi = e.points[0].y;
      onParcelSelect(
        filtered ? filtered.ids[xi] : xi,
        filtered ? filtered.ids[yi] : yi,
      );
    });

    if (onEdgeHover) {
      divRef.current.on('plotly_hover', e => {
        if (!e.points?.[0]) return;
        const xi = e.points[0].x;
        const yi = e.points[0].y;
        onEdgeHover({
          source: filtered ? filtered.ids[xi] : xi,
          target: filtered ? filtered.ids[yi] : yi,
        });
      });
      divRef.current.on('plotly_unhover', () => onEdgeHover(null));
    }

    initializedRef.current = true;

    return () => {
      if (divRef.current) Plotly.purge(divRef.current);
      initializedRef.current = false;
    };
  }, [data, networkHighlight]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fast path: crosshair update only (re-reads filtered from outer scope — same render)
  useEffect(() => {
    if (!divRef.current || !initializedRef.current || !data) return;
    const shapes = filtered
      ? buildFilteredShapes(filtered.ids, selectedParcel, selectedRow)
      : buildFullShapes(data, selectedParcel, selectedRow);
    Plotly.relayout(divRef.current, { shapes });
  }, [selectedParcel, selectedRow]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return null;

  return <div ref={divRef} style={{ width: '100%', height: '100%' }} />;
}
