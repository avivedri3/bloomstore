import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

const VISITOR_KEY = 'bloomstore.visitor';
let lastTracked = '';

function visitorId(): string {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing && /^[A-Za-z0-9-]{8,64}$/.test(existing)) {
    return existing;
  }
  const created = crypto.randomUUID();
  localStorage.setItem(VISITOR_KEY, created);
  return created;
}

export function TrackPageView() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!/^\/[A-Za-z0-9/_-]*$/.test(pathname)) {
      return;
    }
    const stamp = `${pathname}:${Math.floor(Date.now() / 1500)}`;
    if (lastTracked === stamp) {
      return;
    }
    lastTracked = stamp;
    void api.post('/traffic', { path: pathname, visitorId: visitorId() }).catch(() => undefined);
  }, [pathname]);

  return null;
}
