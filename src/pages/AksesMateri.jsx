import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// IMPORT FIREBASE
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function AksesMateri() {
  const [kelasDiikuti, setKelasDiikuti] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Pastikan siswa sudah login sebelum menarik data
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // MENGAMBIL KELAS YANG DIIKUTI SISWA SAJA
        // Logikanya: Cari di koleksi 'kelas', di mana array 'siswa' berisi ID user saat ini
        const q = query(
          collection(db, 'kelas'),
          where('siswa', 'array-contains', user.uid)
        );

        const unsubscribeData = onSnapshot(q, (snapshot) => {
          const dataKelas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setKelasDiikuti(dataKelas);
          setLoading(false);
        });

        return () => unsubscribeData();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Memuat Pustaka Materi...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pustaka Materi</h1>
        <p className="text-slate-500 dark:text-slate-400">Pilih mata pelajaran untuk mulai membaca modul dan literatur.</p>
      </div>

      {kelasDiikuti.length === 0 ? (
        // Tampilan jika siswa belum bergabung ke kelas mana pun
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <AlertCircle size={48} className="mb-4 text-slate-400 dark:text-slate-500" />
          <h3 className="mb-2 text-xl font-bold text-slate-700 dark:text-white">Belum Ada Kelas</h3>
          <p className="max-w-md text-slate-500 dark:text-slate-400">
            Anda belum bergabung dengan kelas mana pun. Silakan kembali ke menu <span className="font-bold">Dashboard</span> dan masukkan Kode Kelas yang diberikan oleh Guru Anda.
          </p>
        </div>
      ) : (
        // Tampilan daftar kelas yang diikuti (Mirip desain asli Anda)
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {kelasDiikuti.map((kelas) => (
            <div key={kelas.id} className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  <BookOpen size={24} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-white">{kelas.nama}</h3>
                <p className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  {/* Ini sementara kita buat statis, nanti bisa dihubungkan ke jumlah materi asli */}
                  <span>Modul Pembelajaran</span>
                </p>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">Progres</span>
                  <span className="text-blue-600 dark:text-blue-400">0%</span>
                </div>
                <div className="mb-6 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: '0%' }}></div>
                </div>

                <button 
                  onClick={() => alert(`Sistem akan membuka modul untuk kelas: ${kelas.nama}`)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Buka Modul &gt;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
