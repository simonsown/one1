'use client';

import React from 'react';
import { Book, Construction } from 'lucide-react';

export default function AdminSchoolsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', color: '#fff' }}>
      <Construction size={64} color="var(--brand-primary)" style={{ marginBottom: '24px', opacity: 0.5 }} />
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Quản lý trường học</h1>
      <p style={{ color: '#8899a6', maxWidth: '500px' }}>
        Tính năng này đang trong quá trình bảo trì và nâng cấp để hỗ trợ kết nối nhiều cơ sở giáo dục hơn.
      </p>
    </div>
  );
}
