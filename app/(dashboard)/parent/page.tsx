'use client';

import React from 'react';
import { ShieldCheck, Heart, LayoutDashboard, Clock, BookOpen, Construction } from 'lucide-react';

export default function ParentDashboard() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>Cổng thông tin <span style={{ color: '#10b981' }}>Phụ huynh</span></h1>
        <p style={{ color: '#8899a6', margin: 0 }}>Theo dõi quá trình rèn luyện và phát triển kỹ năng công nghệ của con.</p>
      </header>

      <div style={{ 
        background: 'rgba(12, 20, 36, 0.8)', padding: '60px 40px', borderRadius: '32px', 
        border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px'
      }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '20px', 
          background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Construction size={40} />
        </div>
        
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 12px 0' }}>Tính năng đang được phát triển</h2>
          <p style={{ color: '#8899a6', maxWidth: '500px', lineHeight: 1.6, margin: '0 auto' }}>
            Hệ thống đang hoàn thiện cổng kết nối dành riêng cho Phụ huynh. 
            Bạn sẽ sớm có thể xem bảng điểm, nhật ký học tập và các đánh giá từ Giáo viên.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', maxWidth: '600px', marginTop: '32px' }}>
          {[
            { icon: <ShieldCheck size={20} />, label: 'Bảo mật tuyệt đối' },
            { icon: <Heart size={20} />, label: 'Kèm cặp sát sao' },
            { icon: <Clock size={20} />, label: 'Cập nhật Realtime' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', color: '#8899a6', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ color: '#10b981' }}>{item.icon}</div>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutDashboard size={20} color="#00f3ff" /> Dashboard Học sinh
          </h3>
          <p style={{ color: '#4b5563', fontSize: '14px' }}>Xem trước giao diện con bạn đang học tập.</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="#f59e0b" /> Tài liệu hướng dẫn
          </h3>
          <p style={{ color: '#4b5563', fontSize: '14px' }}>Cách thức hỗ trợ con học tập hiệu quả tại nhà.</p>
        </div>
      </div>
    </div>
  );
}
