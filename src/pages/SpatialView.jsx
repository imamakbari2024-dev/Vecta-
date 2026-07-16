import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Box, ArrowLeft, Activity } from 'lucide-react';

// KOMPONEN 1: Daftar Pilihan Subjek 3D
const SimulasiMenu = ({ onSelect }) => {
  const modelList = [
    { id: 'heliotropism', nama: 'Simulasi Smart Heliotropism', desc: 'Sistem panel pelacak cahaya matahari' },
    { id: 'servo', nama: 'Kinematika Motor Servo', desc: 'Mekanika pergerakan sudut aktuator' },
    { id: 'enzyra', nama: 'Reaktor ENZYRA', desc: 'Sistem agitasi bioreaktor' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ruang Visualisasi 3D</h1>
        <p className="text-slate-500 dark:text-slate-400">Pilih model sistem untuk melakukan simulasi interaktif menggunakan Spatial Computing.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {modelList.map((model) => (
          <div key={model.id} onClick={() => onSelect(model)} className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all group">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Box size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{model.nama}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{model.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// KOMPONEN 2: Objek 3D (Render)
function SpatialObject({ handData }) {
  const meshRef = useRef();
  useFrame(() => {
    if (!handData.active) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    } else {
      const targetRotationY = (handData.x - 0.5) * Math.PI * 2;
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.1;
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

// KOMPONEN UTAMA
export default function SpatialView() {
  const [activeModel, setActiveModel] = useState(null);
  
  // State untuk engine MediaPipe
  const videoRef = useRef(null);
  const requestRef = useRef(null);
  const [handData, setHandData] = useState({ active: false, x: 0, pinchDistance: 1 });
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Jalankan MediaPipe HANYA JIKA pengguna sudah masuk ke dalam model
  useEffect(() => {
    if (!activeModel) return;

    let handLandmarker;
    let video = videoRef.current;
    
    const initializeHandTracking = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task", delegate: "GPU" },
          runningMode: "VIDEO", numHands: 1
        });
        setIsModelLoaded(true);
        startCamera();
      } catch (error) { console.error(error); }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if(video) { video.srcObject = stream; video.addEventListener("loadeddata", predictWebcam); }
      } catch (err) { console.error(err); }
    };

    const predictWebcam = async () => {
      if (!handLandmarker || !video) return;
      let startTimeMs = performance.now();
      if (video.currentTime > 0) {
        const results = handLandmarker.detectForVideo(video, startTimeMs);
        if (results.landmarks && results.landmarks.length > 0) {
          const l = results.landmarks[0];
          setHandData({ active: true, x: l[0].x, pinchDistance: Math.sqrt(Math.pow(l[4].x - l[8].x, 2) + Math.pow(l[4].y - l[8].y, 2)) });
        } else {
          setHandData(prev => ({ ...prev, active: false }));
        }
      }
      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    initializeHandTracking();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (video && video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
      if (handLandmarker) handLandmarker.close();
    };
  }, [activeModel]);

  // Jika belum memilih model, tampilkan menu
  if (!activeModel) {
    return <SimulasiMenu onSelect={setActiveModel} />;
  }

  // Jika sudah memilih, tampilkan Canvas 3D
  return (
    <div className="flex h-[80vh] w-full flex-col gap-4 lg:flex-row animate-in slide-in-from-right duration-300">
      
      {/* Area 3D Utama */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-slate-800 shadow-xl border border-slate-700">
        <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
          <button onClick={() => setActiveModel(null)} className="rounded-lg bg-slate-900/60 p-2 text-white hover:bg-slate-700 backdrop-blur-sm transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="rounded-lg bg-slate-900/60 px-3 py-1.5 font-bold text-white backdrop-blur-sm">
            {activeModel.nama}
          </h2>
        </div>
        
        {!isModelLoaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90">
            <span className="flex items-center gap-2 font-semibold text-blue-400 animate-pulse"><Activity size={20}/> Menghidupkan Sensor Optik...</span>
          </div>
        )}

        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          <SpatialObject handData={handData} />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      {/* Area Kamera Sidebar */}
      <div className="flex w-full flex-col gap-4 lg:w-80">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-white flex justify-between items-center">
            <span>Telemetri Tangan</span>
            <span className={`h-3 w-3 rounded-full ${handData.active ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></span>
          </h3>
          
          <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video border border-slate-200 dark:border-slate-700">
            <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover transform -scale-x-100"></video>
          </div>
          
          <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
            <p className="flex items-start gap-2">
              <span className="font-bold text-blue-500 mt-0.5">1.</span> 
              <span>Geser kepalan di depan kamera untuk <b className="text-slate-800 dark:text-white">Memutar Model</b>.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-blue-500 mt-0.5">2.</span> 
              <span>Cubit jempol & telunjuk untuk <b className="text-slate-800 dark:text-white">Zoom In</b>.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
