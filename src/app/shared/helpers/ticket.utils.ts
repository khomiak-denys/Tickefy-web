export function statusClass(status: string) {
  const s = String(status || 'open').toLowerCase();
  return {
    badge: true,
    open: s.startsWith('open') || !s || s === '',
    progress: s.includes('progress'),
    completed: s.startsWith('comp') || s.includes('completed'),
    failed: s.includes('fail'),
    cancelled: s.startsWith('canc') || s.includes('cancel'),
    assigned: s.includes('assign'),
    created: s.includes('created'),
    accepted: s.includes('accepted'),
    draft: s.includes('draft'),
  };
}

export function priorityClass(p: string) {
  const v = String(p || '').toLowerCase();
  return {
    pr: true,
    low: v === 'low',
    medium: v === 'medium',
    high: v === 'high',
  };
}
