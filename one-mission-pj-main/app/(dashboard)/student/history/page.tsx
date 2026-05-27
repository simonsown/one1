'use client';

import React from 'react';
import { History, Construction } from 'lucide-react';

export default function StudentHistoryPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', color: '#fff' }}>
      <Construction size={64} color="#10B981" style={{ marginBottom: '24px', opacity: 0.5 }} />
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Lịch sử học tập</h1>
      <p style={{ color: '#8899a6', maxWidth: '500px' }}>
        Tính năng theo dõi tiến trình học tập đang được hoàn thiện. Bạn có thể xem kết quả bài tập trực tiếp trong từng lớp học.
      </p>
    </div>
  );
}
