'use client';

import { useEffect } from 'react';

export function FbclidTracker() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fbclid = params.get('fbclid');
      if (fbclid) {
        localStorage.setItem('studiomenu_fbclid', fbclid);
        document.cookie = `studiomenu_fbclid=${fbclid}; path=/; max-age=2592000; SameSite=Lax`;
      }
    }
  }, []);

  return null;
}
