'use client';

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onComplete, 300);
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: '#ffffff', zIndex: 99999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease', cursor: 'pointer'
        }} onClick={() => { setVisible(false); onComplete(); }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                {/* Spinning arc - top-right, dark gray */}
                <div style={{
                    position: 'absolute', inset: '-6px', borderRadius: '50%',
                    border: '4px solid transparent',
                    borderTopColor: '#5a5a5a',
                    borderRightColor: '#5a5a5a',
                    animation: 'loadingSpin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                }} />
                {/* Logo - square, red background, white text, rounded corners */}
                <div style={{
                    width: '100px', height: '100px', borderRadius: '16px',
                    background: '#D32F2F', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(211, 47, 47, 0.25)',
                    position: 'relative', zIndex: 2
                }}>
                    <span style={{ color: '#fff', fontSize: '28px', fontWeight: 900, letterSpacing: '1px', lineHeight: 1 }}>PC</span>
                    <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', marginTop: '2px' }}>MASTER</span>
                </div>
                <style>{`
                    @keyframes loadingSpin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );
};

export default LoadingScreen;
