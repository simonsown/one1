'use client';

import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const CAMERA_TIMEOUT = 10000;
const MODEL_TIMEOUT = 15000;

const HandTracker = ({ onLandmarks }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [handLandmarker, setHandLandmarker] = useState(null);
    const [webcamRunning, setWebcamRunning] = useState(false);
    const [error, setError] = useState(null);
    const timeoutRef = useRef(null);
    const modelTimeoutRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        modelTimeoutRef.current = setTimeout(() => {
            if (!handLandmarker) {
                setError("Không thể tải mô hình AI do kết nối mạng chậm. Vui lòng thử lại.");
            }
        }, MODEL_TIMEOUT);

        const createHandLandmarker = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
                );
                if (controller.signal.aborted) return;
                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 2
                });
                if (controller.signal.aborted) return;
                if (modelTimeoutRef.current) clearTimeout(modelTimeoutRef.current);
                setHandLandmarker(landmarker);
            } catch (err) {
                console.error("Failed to create HandLandmarker:", err);
                if (modelTimeoutRef.current) clearTimeout(modelTimeoutRef.current);
                setError("Không thể tải mô hình AI. Vui lòng thử lại.");
            }
        };

        createHandLandmarker();
        return () => { controller.abort(); if (modelTimeoutRef.current) clearTimeout(modelTimeoutRef.current); };
    }, []);

    useEffect(() => {
        if (handLandmarker && !webcamRunning && !error) {
            setWebcamRunning(true);
        }
    }, [handLandmarker, webcamRunning, error]);

    useEffect(() => {
        let animationFrameId;
        let streamRef = null;

        const predictWebcam = async () => {
            if (videoRef.current && canvasRef.current && handLandmarker && webcamRunning) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");

                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                let startTimeMs = performance.now();
                const results = await handLandmarker.detectForVideo(video, startTimeMs);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (results.landmarks) {
                    if (onLandmarks) {
                        const mirroredLandmarks = results.landmarks.map((hand, index) => {
                            const newHand = hand.map(point => ({ ...point, x: 1 - point.x }));
                            if (results.handednesses && results.handednesses[index]) {
                                newHand.handedness = results.handednesses[index][0].categoryName;
                            }
                            return newHand;
                        });
                        onLandmarks(mirroredLandmarks);
                    }
                    for (const landmarks of results.landmarks) {
                        drawConnectors(ctx, landmarks, HandLandmarker.HAND_CONNECTIONS, {
                            color: "#00FF00",
                            lineWidth: 5
                        });
                        drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 2 });
                    }
                }

                animationFrameId = window.requestAnimationFrame(predictWebcam);
            }
        };

        if (webcamRunning) {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError("Trình duyệt không hỗ trợ camera.");
                return;
            }

            // Set timeout for camera initialization
            timeoutRef.current = setTimeout(() => {
                if (!videoRef.current?.srcObject) {
                    setError("Camera không phản hồi. Vui lòng kiểm tra quyền truy cập camera và thử lại.");
                    setWebcamRunning(false);
                }
            }, CAMERA_TIMEOUT);

            const constraints = { video: true };
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                streamRef = stream;
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener("loadeddata", () => {
                        predictWebcam();
                    });
                }
            }).catch(err => {
                console.error("Error accessing webcam:", err);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                setError("Không thể truy cập camera: " + err.message);
                setWebcamRunning(false);
            });
        }

        return () => {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (streamRef) {
                streamRef.getTracks().forEach(track => track.stop());
            }
        };
    }, [webcamRunning, handLandmarker, onLandmarks]);

    const handleRetry = () => {
        setError(null);
        setWebcamRunning(true);
    };

    if (error) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#ef4444', gap: '12px', padding: '16px' }}>
                <p style={{ fontSize: '13px', textAlign: 'center', margin: 0 }}>{error}</p>
                <button onClick={handleRetry} style={{ padding: '8px 16px', background: '#00d4aa', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'black', overflow: 'hidden' }}>
            <video
                ref={videoRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                autoPlay
                playsInline
            />
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
            />
            {!handLandmarker && !error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <div className="w-6 h-6 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin" />
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '13px' }}>Đang tải AI Model...</span>
                </div>
            )}
        </div>
    );
};

const drawConnectors = (ctx, landmarks, connections, style) => {
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    for (const connection of connections) {
        const start = landmarks[connection[0]];
        const end = landmarks[connection[1]];
        if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
            ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
            ctx.stroke();
        }
    }
}

const drawLandmarks = (ctx, landmarks, style) => {
    ctx.fillStyle = style.color;
    for (const landmark of landmarks) {
        ctx.beginPath();
        ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, style.lineWidth, 0, 2 * Math.PI);
        ctx.fill();
    }
}

export default HandTracker;
