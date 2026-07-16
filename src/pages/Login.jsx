import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // WORKAROUND: Ubah username menjadi format email dummy untuk Firebase Auth
    // Pastikan di konsol Firebase Auth Anda sudah mendaftarkan user dengan format email ini
    const dummyEmail = `${username.toLowerCase().replace(/\s+/g, '')}@vecta.local`;

    try {
      await signInWithEmailAndPassword(auth, dummyEmail, password);
      // Jika sukses, arahkan ke dashboard siswa
      navigate('/dashboard/siswa');
    } catch (err) {
      console.error(err);
      setError('Gagal masuk. Periksa kembali Nama Lengkap dan Kata Sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-400">Vecta Learning</h1>
        
        {/* Notifikasi Error */}
        {error && (
          <div className="mb-4 rounded bg-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Nama Lengkap (Username)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="Masukkan nama lengkap..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="Masukkan kata sandi..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk ke Sistem'}
          </button>
        </form>
      </div>
    </div>
  );
}
