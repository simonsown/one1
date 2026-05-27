'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, ShieldCheck, Zap, MonitorPlay, Wrench, Bot, HelpCircle, ChevronDown, BookOpen, Users, School, LogIn, UserPlus, GraduationCap, Menu, X, ChevronRight, BarChart3, Award, Clock, PlayCircle, FileText, MessageSquare, Bell, Cpu, CircuitBoard, Search, Home, Compass, Layers, CheckCircle, Target, Cctv } from 'lucide-react';

const s = {
  red: '#D32F2F',
  navy: '#1A2F4A',
  teal: '#0097A7',
  orange: '#F5A623',
  lightBlue: '#E3F2FD',
  textDark: '#1C1C1E',
  textMuted: '#64748B',
};

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      if (u) {
        supabase.from('profiles').select('role, full_name').eq('id', u.id).single().then(({ data: p }) => setProfile(p));
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null);
    router.push('/');
  };

  const dashboardUrl = profile?.role === 'teacher' ? '/teacher' : profile?.role === 'admin' ? '/admin' : '/builder';

  const features = [
    { icon: <Cpu size={22} />, title: 'HỌC LIỆU SỐ AI', desc: 'Trợ lý AI phân tích cấu hình, gợi ý linh kiện theo ngân sách, giải thích chi tiết từng thông số.', color: s.red, items: ['Trợ lý AI phân tích cấu hình', 'Gợi ý linh kiện theo ngân sách', 'Giải thích chi tiết từng thông số'], cta: 'Trải nghiệm ngay', href: '/builder' },
    { icon: <CircuitBoard size={22} />, title: 'PHÒNG LAB 2D', desc: 'Lắp ráp linh kiện trực quan, kiểm tra tương thích tức thì, tính điện năng TDP realtime.', color: s.teal, items: ['Lắp ráp linh kiện trực quan', 'Kiểm tra tương thích tức thì', 'Tính điện năng TDP realtime'], cta: 'Vào Lab ngay', href: '/builder' },
  ];

  return (
    <div style={{ background: '#fff', minHeight: '100vh', color: s.textDark, overflowX: 'hidden' }}>
      {/* NAVBAR */}
      <nav style={{
        height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', borderBottom: '1px solid #E2E8F0',
        position: 'fixed', top: 0, left: 0, right: 0, background: '#fff', zIndex: 10000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px', background: s.red,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 900 }}>PC</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: s.navy }}>
            PC MASTER BUILDER
          </span>
        </div>

        {/* Search bar */}
        <div className="desktop-nav" style={{
          display: 'flex', alignItems: 'center', flex: 1, maxWidth: '460px', margin: '0 24px', position: 'relative'
        }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94A3B8' }} />
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài học, linh kiện..."
            style={{
              width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #E2E8F0',
              padding: '0 12px 0 36px', fontSize: '13px', color: s.textDark, outline: 'none',
              background: '#F8FAFC', fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>
              <Link href={dashboardUrl} style={{
                display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
                padding: '6px 14px', borderRadius: '20px', background: s.navy, color: '#fff',
                fontSize: '13px', fontWeight: 600
              }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <span>{profile?.full_name || 'User'} — {profile?.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</span>
              </Link>
              <button onClick={handleLogout} style={{
                padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0',
                background: '#fff', color: s.textMuted, fontWeight: 600, fontSize: '13px',
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', color: s.textDark, fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <LogIn size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Đăng nhập
                </button>
              </Link>
              <Link href="/register">
                <button style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: s.navy, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <UserPlus size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Đăng ký
                </button>
              </Link>
            </>
          )}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="mobile-hamburger-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: s.textDark, padding: '8px' }}>
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Search bar mobile */}
      <div className="mobile-search" style={{ display: 'none', position: 'fixed', top: '68px', left: 0, right: 0, zIndex: 9999, padding: '12px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input type="text" placeholder="Tìm kiếm..." style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '0 12px 0 36px', fontSize: '14px', outline: 'none', background: '#F8FAFC', fontFamily: 'inherit' }} />
        </div>
      </div>

      {/* Mobile menu */}
      <div style={{
        position: 'fixed', top: '68px', left: 0, right: 0, background: '#fff', zIndex: 9999,
        borderBottom: '1px solid #E2E8F0', padding: '16px',
        transform: mobileMenu ? 'translateY(0)' : 'translateY(-100%)', opacity: mobileMenu ? 1 : 0,
        pointerEvents: mobileMenu ? 'auto' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease'
      }}>
        <Link href="/about" style={{ display: 'block', padding: '12px 16px', color: s.textDark, fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Về chúng tôi</Link>
        <Link href="/builder" style={{ display: 'block', padding: '12px 16px', color: s.textDark, fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Thực hành</Link>
      </div>

      {/* HERO BANNER */}
      <section style={{
        marginTop: '68px', background: `linear-gradient(135deg, ${s.teal} 0%, #006064 100%)`,
        padding: '60px 32px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '20%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '99px',
              background: s.orange, color: '#fff', fontSize: '11px', fontWeight: 700, marginBottom: '16px'
            }}>
              <Sparkles size={14} /> TRỢ LÝ AI GURU — TÍNH NĂNG MỚI
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#fff', lineHeight: 1.15, margin: '0 0 16px 0' }}>
              THỰC HÀNH NGAY
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', maxWidth: '480px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Trải nghiệm phòng Lab 2D mô phỏng lắp ráp PC — AI hướng dẫn chi tiết từng bước, kiểm tra tương thích realtime.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/builder">
                <button style={{ padding: '12px 28px', borderRadius: '8px', border: 'none', background: s.navy, color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Bắt đầu ngay <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/about">
                <button style={{ padding: '12px 28px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Tìm hiểu thêm
                </button>
              </Link>
            </div>
          </div>
          <div className="hero-illustration" style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '160px', lineHeight: 1, opacity: 0.3, filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }}>🖥️</div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS - 2 columns */}
      <section style={{ padding: '60px 32px', background: s.navy }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '32px',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', background: `${f.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color
                }}>
                  {f.icon}
                </div>
                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>{f.title}</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>{f.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {f.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                    <CheckCircle size={14} color={f.color} />
                    {item}
                  </div>
                ))}
              </div>
              <Link href={f.href}>
                <button style={{
                  padding: '10px 24px', borderRadius: '8px', border: 'none', background: s.orange,
                  color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}>
                  {f.cta} <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* STATS ROW */}
      <section style={{ padding: '48px 32px', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
          {[
            { icon: <Cpu size={24} />, num: '50+', label: 'Linh kiện', color: s.red },
            { icon: <Target size={24} />, num: '10+', label: 'Nhiệm vụ', color: s.teal },
            { icon: <Users size={24} />, num: '5,000+', label: 'Học sinh', color: s.navy },
            { icon: <ShieldCheck size={24} />, num: '99%', label: 'Chính xác', color: s.orange },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, margin: '0 auto 12px' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: stat.color, marginBottom: '4px' }}>{stat.num}</div>
              <div style={{ fontSize: '14px', color: s.textMuted, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DETAILED FEATURES */}
      <section style={{ padding: '60px 32px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: s.navy, marginBottom: '12px' }}>Mô phỏng trực quan, kết quả thực tế</h2>
            <p style={{ color: s.textMuted, fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
              Hệ thống giả lập chi tiết thông số kỹ thuật từng linh kiện.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {[
              { icon: <Zap size={20} />, title: 'Tính toán điện năng (TDP)', desc: 'Thời gian thực, chính xác từng thông số', color: s.orange },
              { icon: <ShieldCheck size={20} />, title: 'Kiểm tra tương thích', desc: 'Socket & kích thước Case realtime', color: s.red },
              { icon: <Sparkles size={20} />, title: 'Trợ lý AI phân tích', desc: 'Sửa lỗi cấu hình thông minh', color: s.teal },
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${f.color}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, margin: '0 auto 12px' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: s.navy, marginBottom: '4px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: s.textMuted, lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section style={{ padding: '60px 32px', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: s.navy, marginBottom: '8px' }}>Hướng dẫn sử dụng</h2>
            <p style={{ color: s.textMuted, fontSize: '15px' }}>4 bước đơn giản để bắt đầu</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { step: '01', icon: <GraduationCap size={28} />, title: 'Chọn Vai Trò', desc: 'Đăng nhập và chọn Học sinh hoặc Giáo viên.', color: s.red },
              { step: '02', icon: <Compass size={28} />, title: 'Khám Phá', desc: 'Xem bài giảng, làm quen linh kiện máy tính.', color: s.teal },
              { step: '03', icon: <Wrench size={28} />, title: 'Thực Hành', desc: 'Lắp ráp linh kiện, kiểm tra tương thích, tính TDP.', color: s.orange },
              { step: '04', icon: <Bot size={28} />, title: 'AI Hỗ Trợ', desc: 'Hỏi đáp với AI Guru 24/7.', color: s.navy },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '28px 20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: item.color, marginBottom: '12px' }}>{item.step}</div>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', color: item.color }}>{item.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: s.navy, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: s.textMuted, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 32px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: s.navy, marginBottom: '8px' }}>Câu hỏi thường gặp</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { q: 'Tôi có cần cài đặt phần mềm nào không?', a: 'Không. PC Master Builder là nền tảng 100% Web-based. Bạn chỉ cần một trình duyệt web và kết nối internet.' },
              { q: 'AI Guru có thể giúp gì cho tôi?', a: 'AI Guru là trợ giảng 24/7, giải thích chi tiết linh kiện, hướng dẫn lắp ráp, phân tích lỗi tương thích phần cứng.' },
              { q: 'Có hỗ trợ điện thoại di động không?', a: 'Bài giảng và trắc nghiệm xem tốt trên điện thoại. Phòng Lab 2D khuyến khích dùng PC/Laptop.' },
              { q: 'Giáo viên theo dõi học sinh được không?', a: 'Có. Dashboard giáo viên cho phép tạo lớp, theo dõi tiến độ bài giảng và kết quả kiểm tra.' },
              { q: 'Nội dung có bám sát SGK không?', a: 'Có. Bài giảng bám sát chương trình Tin học THPT sách Kết nối Tri thức và Cánh Diều.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '14px', color: s.textDark }}>
                  {faq.q}
                  <ChevronDown size={18} style={{
                    color: s.textMuted, flexShrink: 0,
                    transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease'
                  }} />
                </div>
                <div style={{
                  maxHeight: activeFaq === i ? '200px' : '0', overflow: 'hidden',
                  transition: 'max-height 0.35s ease, padding 0.25s ease',
                  padding: activeFaq === i ? '0 20px 16px' : '0 20px',
                }}>
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', color: s.textMuted, fontSize: '14px', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '60px 32px', background: s.navy, textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Bắt đầu hành trình ngay</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '24px' }}>Học lắp ráp máy tính với AI — miễn phí, không cần cài đặt.</p>
          <Link href="/register">
            <button style={{ padding: '14px 36px', borderRadius: '8px', border: 'none', background: s.orange, color: '#fff', fontWeight: 800, fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Đăng ký ngay — Miễn phí
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '48px 32px 32px', borderTop: '1px solid #E2E8F0', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: s.red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 900 }}>PC</div>
                <span style={{ fontWeight: 700, fontSize: '15px', color: s.navy }}>PC Master Builder</span>
              </div>
              <p style={{ fontSize: '13px', color: s.textMuted, lineHeight: 1.6, margin: 0 }}>Ứng dụng học tập tin học và lắp ráp máy tính với công nghệ AI.</p>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '13px', marginBottom: '16px', color: s.navy, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sản phẩm</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/builder" style={{ fontSize: '13px', color: s.textMuted, textDecoration: 'none' }}>Thực hành</Link>
                <Link href="/about" style={{ fontSize: '13px', color: s.textMuted, textDecoration: 'none' }}>Về chúng tôi</Link>
                <Link href="/certificates" style={{ fontSize: '13px', color: s.textMuted, textDecoration: 'none' }}>Chứng chỉ</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '13px', marginBottom: '16px', color: s.navy, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hỗ trợ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: s.textMuted }}>
                <span>Email: contact@pc-master.edu.vn</span>
                <span>Hotline: (028) 1234 5678</span>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: s.textMuted, fontSize: '12px', margin: 0 }}>© 2026 PC Master Builder. All rights reserved.</p>
            <span style={{ padding: '2px 10px', borderRadius: '99px', background: '#F1F5F9', color: s.textMuted, fontSize: '10px', fontWeight: 600 }}>AI YOUNG GURU 2026</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-hamburger-btn { display: none !important; }
          .mobile-search { display: none !important; }
        }
        .hero-illustration { display: block; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger-btn { display: flex !important; }
          .mobile-search { display: block !important; }
          .hero-illustration { display: none !important; }
        }
      `}</style>
    </div>
  );
}
