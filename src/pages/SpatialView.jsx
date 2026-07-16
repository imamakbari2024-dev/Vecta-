import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// --- KOMPONEN OBJEK 3D ---
function SpatialObject({ handData }) {
  const meshRef = useRef();

  useFrame(() => {
    if (!handData.active) {
      // Jika tangan tidak terdeteksi, objek berputar perlahan secara otomatis
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    } else {
      // Jika terdeteksi, gunakan nilai koordinat X tangan sebagai sumbu rotasi Y
      // Nilai dari MediaPipe (0 sampai 1) dikonversi menjadi radian rotasi (-PI sampai PI)
      const targetRotationY = (handData.x - 0.5) * Math.PI * 2;
      
      // Interpolasi (Lerp) agar gerakan 3D lebih halus (smooth) tidak kaku
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.1;
      
      // Logika Sederhana Cubit (Pinch) untuk Zoom in/out
      const targetScale = handData.pinchDistance < 0.05 ? 1.5 : 1.0;
      meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.1;
      meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.1;
      meshRef.current.scale.z += (targetScale - meshRef.current.scale.z) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#3b82f6" wireframe={false} />
    </mesh>
  );
}

// --- KOMPONEN UTAMA HALAMAN ---
export default function SpatialView() {
  const videoRef = useRef(null);
  const requestRef = useRef(null);
  const [handData, setHandData] = useState({ active: false, x: 0, pinchDistance: 1 });
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    let handLandmarker;
    let video = videoRef.current;

    // 1. Inisialisasi MediaPipe Vision
    const initializeHandTracking = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setIsModelLoaded(true);
        startCamera();
      } catch (error) {
        console.error("Gagal memuat model MediaPipe:", error);
      }
    };

    // 2. Akses Kamera Webcam
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
      } catch (err) {
        console.error("Gagal mengakses kamera:", err);
      }
    };

    // 3. Looping Deteksi Real-time
    const predictWebcam = async () => {
      if (!handLandmarker || !video) return;

      let startTimeMs = performance.now();
      if (video.currentTime > 0) {
        const results = handLandmarker.detectForVideo(video, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0]; // Ambil data tangan pertama
          
          // Koordinat titik 0 (Pergelangan tangan) untuk rotasi
          const wristX = landmarks[0].x; 
          
          // Hitung jarak antara ujung jempol (titik 4) dan ujung telunjuk (titik 8) untuk fitur cubit (pinch)
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
          );

          setHandData({ active: true, x: wristX, pinchDistance: distance });
        } else {
          setHandData(prev => ({ ...prev, active: false }));
        }
      }
      // Panggil fungsi ini terus menerus setiap frame
      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    initializeHandTracking();

    // Cleanup memori saat pengguna pindah halaman
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
      if (handLandmarker) handLandmarker.close();
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-4 lg:flex-row">
      
      {/* Area Render 3D Utama */}
      <div className="relative flex-1 overflow-hidden rounded-xl bg-slate-800 shadow-xl">
        <h2 className="absolute left-4 top-4 z-10 rounded bg-slate-900/50 p-2 text-lg font-bold text-white backdrop-blur-sm">
          Visualisasi 3D Interaktif
        </h2>
        
        {!isModelLoaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80">
            <span className="animate-pulse text-blue-400 font-semibold">Memuat AI Computer Vision...</span>
          </div>
        )}

        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          <SpatialObject handData={handData} />
          <OrbitControls enableZoom={false} /> {/* Zoom dimatikan dari mouse karena pakai tangan */}
        </Canvas>
      </div>

      {/* Area Kamera / Hand Tracking Feed */}
      <div className="flex w-full flex-col gap-4 lg:w-80">
        <div className="rounded-xl bg-slate-800 p-4 shadow-xl">
          <h3 className="mb-3 font-semibold text-white flex justify-between items-center">
            <span>Umpan Sensor Optik</span>
            <span className={`h-3 w-3 rounded-full ${handData.active ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></span>
          </h3>
          
          <div className="relative w-full overflow-hidden rounded-lg bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover transform -scale-x-100"
            ></video>
          </div>
          
          <div className="mt-4 space-y-2 rounded-lg bg-slate-700/50 p-3 text-sm text-slate-300">
            <p className="flex items-center gap-2">
              <span className="font-bold text-blue-400">1.</span> Geser tangan Anda ke kiri/kanan di depan kamera untuk <b>Memutar Kubus</b>.
            </p>
            <p className="flex items-center gap-2">
              <span className="font-bold text-blue-400">2.</span> Pertemukan ujung jempol dan telunjuk (Cubit/Pinch) untuk <b>Memperbesar (Zoom)</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
