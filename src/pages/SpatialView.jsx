import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html } from '@react-three/drei';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Box, ArrowLeft, Activity, HeartPulse } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// KOMPONEN 1: Daftar Pilihan Subjek 3D (Dinamis dari Firebase)
const SimulasiMenu = ({ onSelect, materi3D, loading }) => {
  if (loading) return <div className="p-8 text-slate-500">Memuat Objek 3D...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ruang Visualisasi 3D</h1>
        <p className="text-slate-500 dark:text-slate-400">Pilih model sistem untuk melakukan simulasi interaktif menggunakan Spatial Computing.</p>
      </div>
      
      {materi3D.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-500">Guru belum mengunggah objek 3D untuk kelas Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materi3D.map((model) => (
            <div key={model.id} onClick={() => onSelect(model)} className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all group">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Box size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{model.judul}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{model.deskripsi || model.namaKelas}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// KOMPONEN 2: Objek Jantung/3D
function SpatialObject({ handData, modelUrl }) {
  const meshRef = useRef();
  
  // Menggunakan URL dinamis dari database, jika gagal fallback ke jantung github
  const finalUrl = modelUrl || "https://cdn.jsdelivr.net/gh/imamakbari2024-dev/Vecta-@main/realistic_human_heart.glb";
  const { scene } = useGLTF(finalUrl);

  useFrame(() => {
    if (meshRef.current) {
      if (!handData.active) {
        meshRef.current.rotation.y += 0.005;
      } else {
        const targetRotationY = (handData.x - 0.5) * Math.PI * 2;
        meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.1;
        const targetScale = handData.pinchDistance < 0.05 ? 2.5 : 1.5;
        meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.1;
        meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.1;
        meshRef.current.scale.z += (targetScale - meshRef.current.scale.z) * 0.1;
      }
    }
  });

  return <primitive ref={meshRef} object={scene} scale={[1.5, 1.5, 1.5]} />;
}

// KOMPONEN UTAMA
export default function SpatialView() {
  const [activeModel, setActiveModel] = useState(null);
  const [materi3D, setMateri3D] = useState([]);
  const [loadingDB, setLoadingDB] = useState(true);
  
  // Mengambil Data 3D dari Firebase
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        onSnapshot(query(collection(db, 'kelas'), where('siswa', 'array-contains', user.uid)), (snapKelas) => {
          const kelasIds = snapKelas.docs.map(doc => doc.id);
          if (kelasIds.length === 0) return setLoadingDB(false);

          onSnapshot(query(collection(db, 'materi'), where('kelasId', 'in', kelasIds)), (snapMateri) => {
            const allMateri = snapMateri.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // HANYA AMBIL YANG TIPE 3D
            setMateri3D(allMateri.filter(m => m.tipe === 'Model 3D (.glb)'));
            setLoadingDB(false);
          });
        });
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const videoRef = useRef(null);
  const requestRef = useRef(null);
  const [handData, setHandData] = useState({ active: false, x: 0, pinchDistance: 1 });
  const [isModelLoaded, setIsModelLoaded] = useState(false);

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

  if (!activeModel) {
    return <SimulasiMenu onSelect={setActiveModel} materi3D={materi3D} loading={loadingDB} />;
  }

  return (
    <div className="flex h-[80vh] w-full flex-col gap-4 lg:flex-row animate-in slide-in-from-right duration-300">
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-slate-800 shadow-xl border border-slate-700">
        <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
          <button onClick={() => setActiveModel(null)} className="rounded-lg bg-slate-900/60 p-2 text-white hover:bg-slate-700 backdrop-blur-sm transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="rounded-lg bg-slate-900/60 px-3 py-1.5 font-bold text-white backdrop-blur-sm">
            {activeModel.judul}
          </h2>
        </div>
        
        {!isModelLoaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90">
            <span className="flex items-center gap-2 font-semibold text-blue-400 animate-pulse"><Activity size={20}/> Menghidupkan Sensor AI...</span>
          </div>
        )}

        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <Environment preset="city" />
          
          <Suspense fallback={<Html center><p className="text-white font-bold animate-pulse">Memuat 3D...</p></Html>}>
            {/* Melempar model URL yang diunggah Guru */}
            <SpatialObject handData={handData} modelUrl={activeModel.link} />
          </Suspense>
          
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-80">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 h-full flex flex-col">
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-white flex justify-between items-center">
            <span>Telemetri Kamera</span>
            <span className={`h-3 w-3 rounded-full ${handData.active ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></span>
          </h3>
          
          <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video border border-slate-200 dark:border-slate-700">
            <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover transform -scale-x-100"></video>
          </div>
          
          <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-300 border border-slate-100 dark:border-slate-800 flex-1">
            <p className="flex items-start gap-2">
              <span className="font-bold text-red-500 mt-0.5">1.</span> 
              <span>Geser telapak tangan Anda ke Kiri atau Kanan untuk <b className="text-slate-800 dark:text-white">Memutar Model</b>.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-red-500 mt-0.5">2.</span> 
              <span>Rapatkan Jempol dan Telunjuk Anda (Mencubit) untuk <b className="text-slate-800 dark:text-white">Memperbesar (Zoom In)</b>.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
