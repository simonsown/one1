'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MapPin, ExternalLink, ShieldCheck, Heart, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AboutPage() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeam() {
            const { data } = await supabase.from('project_team').select('*').order('order_index', { ascending: true });
            if (data && data.length > 0) {
                setTeam(data);
            } else {
                setTeam([
                    { id: '1', full_name: 'Nguyễn Phúc Khánh Sơn', image_url: 'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/653957156_910112394987079_1645940152965631_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeGcOn7lF_53vWDQ-Vm4HA-Zxh00KoWXF2_GHTQqhZcXb66BK2PZ-bAy85JWF903T0ML7wNOmj0rrdLT7FgXVo0G&_nc_ohc=oPV_VC9f0bgQ7kNvwGN2Xbg&_nc_oc=Ado-QlXjWwlHOvO2PZRrAEVpxCb6oDZnJQ9RgU-_RqcEKTCwr_HzhKrZiqzKciBwZGo&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=Z6IoA877no7BMXiKsZXEBQ&_nc_ss=7b2a8&oh=00_Af0Vhd1dco0JSm43oNviiG02WyrADuZnkoXGz9uT5DZaag&oe=69F7AECB' },
                    { id: '2', full_name: 'Dương Vũ Minh Đức', image_url: 'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/629272107_1436246731626695_125407128577002054_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeEm31tqBaGoJmAaFTDom5bN6LM02P2Oqr7oszTY_Y6qvgACNGpDIQsO1bnUd91EEbwVTSq_71zEmwyErAOtYc5b&_nc_ohc=UTW3o8qfpEoQ7kNvwG_NXRY&_nc_oc=AdqHhtKiK9gbRtYuHYcR-JderB4hJ3PRgt8ptJJpIwcm1wPeRXRJayGxt0o5O3-Irsw&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=GCK21wvQWxPtJlpzYnNx5g&_nc_ss=7b2a8&oh=00_Af2OInKNSlzcdLshnwzaoxAgJN8BcPl24tVoCdjzfZKy0g&oe=69F796F6' }
                ]);
            }
            setLoading(false);
        }
        fetchTeam();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#050507', color: '#fff', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
            
            <header style={{ 
                height: '50vh', position: 'relative', overflow: 'hidden', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', background: 'radial-gradient(circle at center, rgba(0, 243, 255, 0.05) 0%, rgba(5, 5, 7, 1) 70%)'
            }}>
                <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 100 }}>
                    <Link href="/" style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', textDecoration: 'none', 
                        fontWeight: 700, background: 'rgba(255,255,255,0.03)', padding: '12px 24px', 
                        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                    }}>
                        <ArrowLeft size={20} /> Quay lại trang chủ
                    </Link>
                </div>

                <div style={{ maxWidth: '1000px', padding: '0 24px', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(0, 243, 255, 0.1)', borderRadius: '100px', color: 'var(--brand-primary)', fontSize: '13px', fontWeight: 700, marginBottom: '24px', letterSpacing: '1px' }}>
                        <Sparkles size={14} /> ONE MISSION TEAM
                    </div>
                    <h1 style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 900, marginBottom: '24px', lineHeight: 1, letterSpacing: '-0.04em' }}>
                        Về Chúng Tôi
                    </h1>
                </div>
            </header>

            <section style={{ padding: '80px 24px', background: 'linear-gradient(to bottom, #050507, #0a0a0c)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', alignItems: 'center' }}>
                    <div style={{ animation: 'fadeInLeft 1s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 243, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                                <BookOpen size={24} />
                            </div>
                            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Sứ Mệnh Di Sản</h2>
                        </div>
                        
                        <div style={{ fontSize: '18px', color: '#8899a6', lineHeight: 1.8, marginBottom: '32px' }}>
                            <p style={{ fontStyle: 'italic', color: '#fff', fontSize: '20px', marginBottom: '24px' }}>
                                "PC Master Builder" là dự án giải pháp ứng dụng công nghệ và AI đang trong quá trình chạy thử nghiệm (Pilot Run), được phát triển bởi One Mission Team.
                            </p>
                            <p>
                                Chúng tôi khao khát ứng dụng sức mạnh của Công nghệ và AI để giải quyết các thách thức trong việc học tập và thực hành lắp ráp máy tính. Hiện tại, sản phẩm đang được vận hành thử nghiệm trên các hạ tầng công nghệ hiện đại nhất để kiểm chứng tính khả thi và hiệu quả giáo dục.
                            </p>
                        </div>

                        <div style={{ 
                            padding: '24px', borderRadius: '20px', background: 'rgba(0, 243, 255, 0.03)', 
                            borderLeft: '4px solid var(--brand-primary)', color: 'var(--brand-primary)',
                            fontWeight: 700, fontSize: '16px', letterSpacing: '0.05em', lineHeight: 1.5
                        }}>
                            VỚI TINH THẦN "DÁM NGHĨ - DÁM LÀM", CHÚNG TÔI CAM KẾT MANG ĐẾN NHỮNG Ý TƯỞNG ĐỘT PHÁ VÀ NỖ LỰC HOÀN THIỆN SẢN PHẨM TỪNG NGÀY.
                        </div>
                    </div>

                    <div style={{ 
                        position: 'relative', borderRadius: '32px', overflow: 'hidden', 
                        boxShadow: '0 25px 50px -12px rgba(0, 243, 255, 0.25)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        aspectRatio: '16/9', animation: 'fadeInRight 1s ease'
                    }}>
                        <img 
                            src="/vision-spread.png" 
                            alt="One Mission Vision" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    </div>
                </div>
            </section>

            <section style={{ padding: '60px 24px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: 900, textAlign: 'center', marginBottom: '60px', letterSpacing: '-0.02em' }}>
                        Đội Ngũ <span style={{ color: 'var(--brand-primary)' }}>Phát Hành</span>
                    </h2>
                    {loading ? (
                        <div style={{ textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="var(--brand-primary)" /></div>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '60px' }}>
                            {team.map((member) => (
                                <div key={member.id} style={{ textAlign: 'center', width: '320px' }}>
                                    <div style={{ 
                                        position: 'relative', width: '320px', height: '420px', 
                                        marginBottom: '32px', borderRadius: '40px', overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0c'
                                    }}>
                                        <img src={member.image_url} alt={member.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <h3 style={{ fontSize: '28px', fontWeight: 800, margin: '0' }}>{member.full_name}</h3>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px' }}>
                        <div>
                            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '32px' }}>TRƯỜNG THPT <br/>NGUYỄN CÔNG TRỨ</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'flex', gap: '16px' }}><MapPin color="var(--brand-primary)" /> 97 Quang Trung, Phường 8, Gò Vấp, TP. HCM</div>
                                <div style={{ display: 'flex', gap: '16px' }}><Phone color="var(--brand-primary)" /> 077 293 4951</div>
                                <div style={{ display: 'flex', gap: '16px' }}><Mail color="var(--brand-primary)" /> phuckhanhsonnguyen@gmail.com</div>
                                <a href="https://maps.app.goo.gl/CDytzt1bYAJ7zVew7" target="_blank" style={{ color: 'var(--brand-primary)', textDecoration: 'underline', marginTop: '20px' }}>Mở trong Google Maps →</a>
                            </div>
                        </div>

                        <div style={{ height: '450px', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.84715830911!2d106.6661623147491!3d10.82329389228965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528e57849e531%3A0xc3b320d72c0d3b3c!2zVHLGsOG7nW5nIFRIUFQgTmd1eeG7hW4gQ8O0bmcgVHLhu6k!5e0!3m2!1svi!2s!4v1651130000000!5m2!1svi!2s" 
                                width="100%" height="100%" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
                                allowFullScreen={true} loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ padding: '60px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                One Mission Team - THPT Nguyễn Công Trứ
            </footer>
        </div>
    );
}
