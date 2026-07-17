import React, { useState } from 'react';
import { db, auth } from '../lib/firebase'; // Sesuaikan path import
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { LogIn, CheckCircle } from 'lucide-react';

export default function DashboardSiswa() {
  const [kodeInput, setKodeInput] = useState('');
  const [pesan, setPesan] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleGabungKelas = async (e) => {
    e.preventDefault();
    if (!kodeInput.trim()) return;
    setLoading(true);
    setPesan({ text: '', type: '' });

    try {
      // 1. Cari kelas di Firestore berdasarkan kode yang diinput
      const q = query(collection(db, 'kelas'), where('kode', '==', kodeInput.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setPesan({ text: 'Kode kelas tidak ditemukan. Periksa kembali kodenya.', type: 'error' });
        setLoading(false);
        return;
      }

      // 2. Jika ketemu, ambil ID dokumen kelas tersebut
      const kelasDoc = querySnapshot.docs[0];
      const kelasRef = doc(db, 'kelas', kelasDoc.id);

      // 3. Tambahkan ID siswa yang sedang login ke dalam array "siswa" di kelas tersebut
      const userId = auth.currentUser.uid;
      await updateDoc(kelasRef, {
        siswa: arrayUnion(userId) // Mencegah duplikasi data jika siswa masuk 2x
      });

      setPesan({ text: `Berhasil bergabung dengan kelas ${kelasDoc.data().nama}!`, type: 'success' });
      setKodeInput('');

    } catch (error) {
      console.error(error);
      setPesan({ text: 'Terjadi kesalahan sistem.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Belajar</h1>
        <p className="text-slate-500 dark:text-slate-400">Selamat datang kembali! Lanjutkan progres belajarmu.</p>
      </div>

      {/* Form Gabung Kelas */}
      <div className="max-w-md rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <LogIn size={20} className="text-blue-500" /> Gabung Kelas Baru
        </h3>
        
        <form onSubmit={handleGabungKelas} className="flex flex-col gap-3">
          <input 
            type="text" 
            value={kodeInput}
            onChange={(e) => setKodeInput(e.target.value)}
            placeholder="Masukkan kode unik (Cth: MEK-7X2A)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-mono uppercase focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Mencari Kelas..." : "Gabung Sekarang"}
          </button>
        </form>

        {/* Notifikasi Sukses/Gagal */}
        {pesan.text && (
          <div className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-sm font-medium ${pesan.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-green-50 text-green-600 dark:bg-green-900/20'}`}>
            {pesan.type === 'success' && <CheckCircle size={18} />}
            {pesan.text}
          </div>
        )}
      </div>
      
      {/* Di bawah ini Anda bisa meletakkan UI Pustaka Materi yang sudah Anda buat sebelumnya */}
    </div>
  );
}
