import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Route, CheckCircle, Circle, Lock } from 'lucide-react';

export default function MengikutiAlur() {
  const [kelasDiikuti, setKelasDiikuti] = useState([]);
  const [kelasIdTerpilih, setKelasIdTerpilih] = useState('');
  const [alurPembelajaran, setAlurPembelajaran] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil kelas yang diikuti oleh siswa ini
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const qKelas = query(collection(db, 'kelas'), where('siswa', 'array-contains', user.uid));
        onSnapshot(qKelas, (snapshot) => {
          const dataKelas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setKelasDiikuti(dataKelas);
          if (dataKelas.length > 0 && !kelasIdTerpilih) {
            setKelasIdTerpilih(dataKelas[0].id); // Otomatis pilih kelas pertama
          }
          setLoading(false);
        });
      }
    });
    return () => unsubscribeAuth();
  }, [kelasIdTerpilih]);

  // Ambil data alur (Roadmap) dari kelas yang dipilih
  useEffect(() => {
    if (!kelasIdTerpilih) return;
    const qAlur = query(collection(db, 'alur'), where('kelasId', '==', kelasIdTerpilih), orderBy('urutan', 'asc'));
    const unsubAlur = onSnapshot(qAlur, (snapshot) => {
      setAlurPembelajaran(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubAlur();
  }, [kelasIdTerpilih]);

  if (loading) return <div className="p-8 text-slate-500">Memuat Roadmap...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Alur Pembelajaran</h1>
          <p className="text-slate-500 dark:text-slate-400">Ikuti langkah belajar secara terstruktur untuk menguasai materi.</p>
        </div>
        
        {/* Pilihan Kelas */}
        {kelasDiikuti.length > 0 && (
          <select 
            value={kelasIdTerpilih} 
            onChange={(e) => setKelasIdTerpilih(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {kelasDiikuti.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        )}
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        {kelasDiikuti.length === 0 ? (
          <div className="text-center py-10 text-slate-500">Anda belum bergabung ke kelas mana pun.</div>
        ) : alurPembelajaran.length === 0 ? (
          <div className="text-center py-10 text-slate-500">Guru belum mengatur alur untuk kelas ini.</div>
        ) : (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
            {alurPembelajaran.map((tahap, index) => {
              // Simulasi: Tahap 1 terbuka (active), sisanya terkunci
              const isTerbuka = index === 0; 
              
              return (
                <div key={tahap.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 dark:border-slate-800 ${isTerbuka ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}>
                    {isTerbuka ? <Circle size={14} className="fill-current" /> : <Lock size={16} />}
                  </div>
                  
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl border shadow-sm transition-all ${isTerbuka ? 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20' : 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700 dark:bg-slate-900/50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isTerbuka ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>TAHAP {tahap.urutan} • {tahap.tipe}</span>
                    </div>
                    <h4 className={`text-lg font-bold mb-3 ${isTerbuka ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{tahap.judul}</h4>
                    
                    <button disabled={!isTerbuka} className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors ${isTerbuka ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800'}`}>
                      {isTerbuka ? 'Mulai Pelajari' : 'Terkunci'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
