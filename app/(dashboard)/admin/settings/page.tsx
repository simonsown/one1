'use client';

import React from 'react';
import { Settings, Construction } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', color: '#fff' }}>
      <Construction size={64} color="var(--brand-primary)" style={{ marginBottom: '24px', opacity: 0.5 }} />
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Cài đặt hệ thống</h1>
      <p style={{ color: '#8899a6', maxWidth: '500px' }}>
        Các cấu hình nâng cao về bảo mật và hệ thống đang được thiết lập bởi đội ngũ kỹ thuật.
      </p>
    </div>
  );
}
