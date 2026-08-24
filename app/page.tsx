'use client';
import { useState } from 'react';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<{role: string, text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!msg.trim()) return;
    const userMsg = { role: 'user', text: msg };
    setChat([...chat, userMsg]);
    setMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat-bubble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setChat(prev => [...prev, { role: 'bot', text: data.reply || data.error }]);
    } catch {
      setChat(prev => [...prev, { role: 'bot', text: 'Chat offline' }]);
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setOpen(!open)}
        style={{position: 'fixed', bottom: 20, right: 20, zIndex: 9999, borderRadius: '50%', width: 60, height: 60, background: '#2563eb', color: 'white', border: 'none', fontSize: 24, cursor: 'pointer'}}
      >
        💬
      </button>
      
      {open && (
        <div style={{position: 'fixed', bottom: 90, right: 20, width: 320, height: 400, background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 9999, display: 'flex', flexDirection: 'column'}}>
          <div style={{padding: 12, background: '#2563eb', color: 'white', borderRadius: '12px 12px 0 0', fontWeight: 'bold'}}>Pasiya AI</div>
          <div style={{flex: 1, padding: 10, overflowY: 'auto'}}>
            {chat.map((c, i) => (
              <div key={i} style={{textAlign: c.role === 'user' ? 'right' : 'left', margin: '8px 0'}}>
                <span style={{background: c.role === 'user' ? '#2563eb' : '#e5e7eb', color: c.role === 'user' ? 'white' : 'black', padding: '6px 10px', borderRadius: 8, display: 'inline-block', maxWidth: '80%'}}>{c.text}</span>
              </div>
            ))}
            {loading && <div>Typing...</div>}
          </div>
          <div style={{display: 'flex', padding: 10, borderTop: '1px solid #ddd'}}>
            <input 
              value={msg} 
              onChange={e => setMsg(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type message..." 
              style={{flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ccc'}}
            />
            <button onClick={send} style={{marginLeft: 8, padding: '8px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8}}>Send</button>
          </div>
        </div>
      )}
    </>
  );
} 
