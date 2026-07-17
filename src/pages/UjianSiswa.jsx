import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export default function UjianSiswa({ tugasId }) {
  const [tugas, setTugas] = useState(null);
  const [jawaban, setJawaban] = useState('');

  // Kirim Jawaban + Kirim Log ke Dashboard Guru
  const handleKirimJawaban = async () => {
    try {
      // 1. Simpan Jawaban ke koleksi 'jawaban_siswa'
      await addDoc(collection(db, 'jawaban_siswa'), {
        tugasId,
        siswaId: auth.currentUser.uid,
        jawaban: jawaban,
        createdAt: serverTimestamp()
      });

      // 2. Kirim Log Aktivitas (Agar Dashboard Guru terupdate)
      await addDoc(collection(db, 'log_aktivitas'), {
        namaSiswa: auth.currentUser.displayName || "Siswa",
        aksi: `Mengirimkan jawaban untuk: ${tugas.judul}`,
        createdAt: serverTimestamp()
      });

      alert("Jawaban berhasil dikirim!");
    } catch (error) {
      alert("Gagal mengirim jawaban.");
    }
  };

  return (
    <div className="p-8">
      {/* Tampilan soal dan input jawaban siswa */}
    </div>
  );
}
