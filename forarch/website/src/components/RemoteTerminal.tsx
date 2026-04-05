import { useState, useEffect, useRef } from 'react';
import { Terminal, Square, Activity, Send, Zap } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';

// Helper to convert ANSI codes to styled React elements
const AnsiLine = ({ text }: { text: string }) => {
  if (!text) return null;
  
  // Basic ANSI parser for common colors and Rich tags
  // Rich uses [color]text[/] which gets converted to ANSI by the CLI
  const parts = text.split(/(\x1b\[[0-9;]*m)/);
  let currentColor = '';
  let isBold = false;
  let isDim = false;

  return (
    <div className="break-words whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/\x1b\[([0-9;]*)m/);
        if (match) {
          const codes = match[1].split(';');
          codes.forEach(code => {
            if (code === '0') { currentColor = ''; isBold = false; isDim = false; }
            if (code === '1') isBold = true;
            if (code === '2') isDim = true;
            if (code === '31') currentColor = '#ff5555'; // Red
            if (code === '32') currentColor = '#50fa7b'; // Green
            if (code === '33') currentColor = '#f1fa8c'; // Yellow
            if (code === '34') currentColor = '#bd93f9'; // Blue
            if (code === '35') currentColor = '#ff79c6'; // Magenta
            if (code === '36') currentColor = '#8be9fd'; // Cyan
            if (code === '37') currentColor = '#f8f8f2'; // White
            if (code === '90') currentColor = '#6272a4'; // Gray
          });
          return null;
        }
        if (!part) return null;
        return (
          <span 
            key={i} 
            style={{ 
              color: isDim ? '#6272a4' : (currentColor || undefined), 
              fontWeight: isBold ? 'bold' : 'normal',
              textShadow: currentColor ? `0 0 8px ${currentColor}33` : 'none',
              opacity: isDim ? 0.6 : 1
            }}
          >
            {part}
          </span>
        );
      })}
    </div>
  );
};

export function RemoteTerminal() {
  const [logs, setLogs] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const q = query(collection(db, `hubs/${uid}/logs`), orderBy('timestamp', 'asc'), limit(500));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(logsData);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const sendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !auth.currentUser) return;
    try {
      const commandStr = input.trim();
      setInput('');
      await addDoc(collection(db, `hubs/${auth.currentUser.uid}/commands`), {
        cmd: commandStr,
        timestamp: serverTimestamp(),
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="glass-panel p-6 rounded-[2.5rem] relative overflow-hidden flex flex-col h-[650px] border border-white/10 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent)] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Terminal size={24} className="text-brand-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">ForArch <span className="text-brand-500">Node</span></h3>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3].map(i => (
                  <div key={i} className="w-1 h-3 rounded-full bg-brand-500 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
                ))}
              </div>
              <span className="text-[10px] text-brand-400 font-black uppercase tracking-[0.2em]">Telemetry Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => setLogs([])}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/10"
                title="Clear Web Display"
            >
                <Zap size={18} />
            </button>
            <button 
                onClick={async () => {
                    if (!auth.currentUser) return;
                    await addDoc(collection(db, `hubs/${auth.currentUser.uid}/commands`), {
                    cmd: "/stop",
                    timestamp: serverTimestamp(),
                    });
                }}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-2.5 rounded-xl text-xs font-black transition-all border border-red-500/20 active:scale-95 group"
            >
                <Square size={14} className="group-hover:fill-current" />
                KILL CORE
            </button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-[#0a0a0c] rounded-[2rem] p-8 font-mono text-[13px] mb-6 border border-white/5 relative group custom-scrollbar shadow-inner"
      >
        {/* Matrix-like scanline overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
        
        <div className="relative z-10 space-y-1">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-500/20 gap-4 mt-20">
              <Activity size={48} className="animate-pulse" />
              <div className="font-black tracking-[0.3em] uppercase text-xs">Awaiting Core Uplink...</div>
            </div>
          ) : (
            logs.map((log) => (
              <AnsiLine key={log.id} text={log.msg} />
            ))
          )}
        </div>
      </div>

      <form onSubmit={sendCommand} className="flex gap-4 shrink-0 relative z-10">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-brand-500/50 focus-within:bg-white/10 transition-all flex items-center px-6 shadow-2xl group">
          <span className="text-brand-500 font-black mr-4 group-focus-within:animate-bounce">{">>"}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent flex-1 py-5 outline-none text-white font-mono text-sm placeholder:text-white/10"
            placeholder="Inject command to remote listener..."
          />
        </div>
        <button 
          type="submit"
          className="bg-brand-600 hover:bg-brand-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] px-10 py-5 rounded-2xl text-white font-black text-sm transition-all active:scale-95 flex items-center gap-3 border border-brand-400/20"
        >
          <Send size={18} />
          SEND
        </button>
      </form>
    </div>
  );
}
