import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, ExternalLink, Box } from 'lucide-react'; // Box ditambahkan untuk ikon 3D
import { useNavigate } from 'react-router-dom'; // IMPORT NAVIGASI

// IMPORT FIREBASE
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function AksesMateri() {
  const [kelasDiikuti, setKelasDiikuti] = useState([]);
  const [materiKelas, setMateriKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); // INISIALISASI FUNGSI PINDAH HALAMAN

  // 1. Ambil kelas yang diikuti siswa
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(collection(db, 'kelas'), where('siswa', 'array-contains', user.uid));
        onSnapshot(q, (snapshot) => {
          setKelasDiikuti(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Ambil semua materi untuk kelas yang diikuti
  useEffect(() => {
    if (kelasDiikuti.length === 0) return;
    
    const kelasIds = kelasDiikuti.map(k => k.id);
    const qMateri = query(collection(db, 'materi'), where('kelasId', 'in', kelasIds));
    
    onSnapshot(qMateri, (snapshot) => {
      setMateriKelas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [kelasDiikuti]);

  if (loading) return <div className="p-8 text-slate-500">Memuat Pustaka Materi...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pustaka Materi</h1>
        <p className="text-slate-500 dark:text-slate-400">Pilih materi dari kelas yang Anda ikuti.</p>
      </div>

      {materiKelas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <AlertCircle size={48} className="mb-4 text-slate-400" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-white">Belum Ada Materi</h3>
          <p className="text-slate-500">Guru Anda belum mengunggah materi untuk kelas ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materiKelas.map((materi) => (
            <div key={materi.id} className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-blue-300 transition-colors">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  <BookOpen size={24} />
                </div>
                <h3 className="mb-1 text-lg font-bold text-slate-800 dark:text-white">{materi.judul}</h3>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">{materi.namaKelas}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{materi.tipe}</p>
              </div>

              {/* LOGIKA TOMBOL: Membedakan tombol 3D dan tombol materi biasa */}
              {materi.tipe === 'Model 3D (.glb)' ? (
                <button 
                  onClick={() => navigate('/visualisasi-3d')} 
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  Buka di Visualisasi 3D <Box size={16} />
                </button>
              ) : (
                <a 
                  href={materi.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Buka Materi <ExternalLink size={16} />
                </a>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
