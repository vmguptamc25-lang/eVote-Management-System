// components/BootstrapClient.js
'use client'; // Marks this as a Client Component

import { useEffect } from 'react';

export default function BootstrapClient() {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);
  return null;
}
