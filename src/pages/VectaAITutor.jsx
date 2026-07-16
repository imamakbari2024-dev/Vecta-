import React, { useState, useRef, useEffect } from 'react';

// SYSTEM PROMPT dari Anda (Diletakkan di luar komponen agar tidak membebani render ulang)
const SYSTEM_PROMPT = `Kamu adalah AI Tutor Pribadi yang bertugas membantu pengguna belajar, memahami konsep, dan melatih kemampuan berpikir kritis.
Tujuan utamamu bukan memberikan jawaban instan, melainkan membimbing pengguna menemukan jawabannya sendiri melalui proses berpikir yang terarah.

Aturan Utama:
1. Jangan pernah langsung memberikan jawaban akhir ketika pengguna mengajukan soal, tugas, atau pertanyaan yang membutuhkan proses berpikir.
2. Selalu gunakan metode pembelajaran bertahap (step-by-step): Identifikasi apa yang ditanyakan -> Tanyakan apa yang sudah dipahami pengguna -> Berikan petunjuk kecil -> Minta pengguna mencoba sendiri -> Evaluasi jawabannya -> Berikan jawaban lengkap hanya jika pengguna sudah mencoba beberapa kali atau meminta setelah proses belajar.
3. Jangan pernah mengerjakan tugas pengguna secara penuh pada percobaan pertama.
4. Jangan memberikan jawaban pilihan ganda secara langsung.
5. Jika pengguna meminta rumus, jelaskan asal-usulnya.

Tingkat Bantuan (Gunakan berurutan):
Level 1: Pertanyaan pemandu. Level 2: Petunjuk kecil. Level 3: Contoh mirip. Level 4: Sebagian penyelesaian. Level 5: Penyelesaian lengkap.

Jika Pengguna Memaksa ("langsung jawab"):
Balas dengan sopan bahwa tujuan AI adalah membantu memahami materi secara bertahap.

Di Luar Pembelajaran:
Jika bertanya tentang hiburan, gosip, game, dll., jawablah: "Maaf, saya hanya dirancang untuk membantu proses belajar dan memahami materi akademik. Silakan ajukan pertanyaan yang berkaitan dengan pembelajaran, konsep, atau latihan soal."`;

export default function VectaAITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Tambahkan pesan user ke UI
    const newUserMsg = { role: 'user', content: input };
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Susun format pesan untuk API Groq (System -> History -> Current User Message)
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...updatedMessages.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user', // Groq menggunakan 'assistant' bukan 'ai'
          content: msg.content
        }))
      ];

      // Memanggil Groq API menggunakan Fetch
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: apiMessages,
          temperature: 0.7, // Sedikit kreativitas untuk gaya mengajar yang natural
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponseText = data.choices[0].message.content;

      // Tambahkan balasan AI ke UI
      setMessages((prev) => [...prev, { role: 'ai', content: aiResponseText }]);
      
    } catch (error) {
      console.error("Groq API Error:", error);
      setMessages((prev) => [...prev, { 
        role: 'ai', 
        content: 'Maaf, terjadi gangguan koneksi dengan server AI. Silakan coba lagi.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[85vh] flex-col rounded-xl bg-slate-800 shadow-xl">
      <div className="border-b border-slate-700 p-4">
        <h2 className="text-xl font-bold text-white">Vecta AI (LLaMA 3.3)</h2>
        <p className="text-sm text-slate-400">Tutor Cerdas Pendamping Belajarmu.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-slate-500">
            <p className="text-center">Ketik pertanyaan pertamamu untuk memulai sesi belajar...</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm' 
                : 'bg-slate-700 text-slate-200 rounded-bl-sm border border-slate-600'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-slate-600 bg-slate-700 p-4 text-slate-400">
              <span className="animate-pulse italic text-sm">AI sedang menganalisis pertanyaanmu...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-slate-700 p-4 bg-slate-800 rounded-b-xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Apa yang ingin kamu pelajari hari ini?"
            className="flex-1 rounded-xl border border-slate-600 bg-slate-900 p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-blue-600 px-8 font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}