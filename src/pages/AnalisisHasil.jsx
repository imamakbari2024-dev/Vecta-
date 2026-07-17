import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { BarChart2, Award, BookOpen, Clock } from 'lucide-react';

export default function AnalisisHasil() {
  const [hasilBelajar, setHasilBelajar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rataRata, setRataRata] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Ambil data jawaban milik siswa ini saja
        const q = query(
          collection(db, 'jawaban_siswa'), 
          where('siswaId', '==', user.uid)
        );

        onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Urutkan manual berdasarkan waktu (karena menghindari error index Firebase)
          data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          
          setHasilBelajar(data);

          // Hitung Rata-rata
          const tugasDinilai = data.filter(item => item.nilai !== null && item.nilai !== undefined);
          if (tugasDinilai.length > 0) {
            const total = tugasDinilai.reduce((sum, item) => sum + Number(item.nilai), 0);
            setRataRata((total / tugasDinilai.length).toFixed(1));
          } else {
            setRataRata(0);
          }
          
          setLoading(false);
        });
      }
    });
    return () => unsubscribeAuth();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Memuat analisis data...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analisis Hasil Belajar</h1>
        <p className="text-slate-500 dark:text-slate-400">Pantau perkembangan nilai dan pencapaian akademik Anda.</p>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 shadow-md text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"><BarChart2 size={32} /></div>
          <div>
            <p className="text-blue-100 font-medium mb-1">Rata-Rata Nilai Keseluruhan</p>
            <h2 className="text-4xl font-black">{rataRata}</h2>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50"><BookOpen size={32} /></div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Tugas Dikerjakan</p>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white">{hasilBelajar.length}</h2>
          </div>
        </div>
      </div>

      {/* Riwayat Penilaian */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Riwayat Evaluasi</h3>
        
        {hasilBelajar.length === 0 ? (
          <div className="text-center py-10 text-slate-500">Anda belum mengerjakan tugas apa pun.</div>
        ) : (
          <div className="space-y-4">
            {hasilBelajar.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700">
                <div className="mb-4 sm:mb-0">
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">{item.judulTugas}</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Clock size={14}/> Menunggu hasil revisi</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                  <Award size={20} className={item.nilai ? "text-amber-500" : "text-slate-300"} />
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nilai Akhir</p>
                    <p className={`font-black text-xl ${item.nilai ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                      {item.nilai !== null && item.nilai !== undefined ? item.nilai : "Menunggu"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
