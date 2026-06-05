export function subsetMatrix(matrix, indices) {
  return indices.map(i => indices.map(j => matrix[i][j]));
}

export function upperTriangleMean(matrix) {
  const vals = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix[i].length; j++) {
      vals.push(matrix[i][j]);
    }
  }
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function crossMean(matrix, rowIndices, colIndices) {
  const vals = [];
  for (const i of rowIndices) {
    for (const j of colIndices) {
      if (i !== j) vals.push(matrix[i][j]);
    }
  }
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function computeNetworkBreakpoints(networkIndex) {
  const allIds = Object.values(networkIndex).flat().sort((a, b) => a - b);
  const breaks = [];
  const networks = Object.keys(networkIndex);
  let pos = 0;
  for (const net of networks) {
    const count = (networkIndex[net] ?? []).length;
    if (pos > 0) breaks.push(pos - 0.5);
    pos += count;
  }
  return breaks;
}
