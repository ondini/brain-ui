export const NETWORK_COLORS = {
  Default:     '#E84040',
  Cont:        '#F28500',
  SalVentAttn: '#9B59B6',
  DorsAttn:    '#2ECC71',
  SomMot:      '#3498DB',
  Vis:         '#8E44AD',
  Limbic:      '#F1C40F',
  Unknown:     '#64748b',
};

export function networkColor(network) {
  return NETWORK_COLORS[network] ?? NETWORK_COLORS.Unknown;
}
