import React, { useState, useEffect } from 'react';
import { Clock, Gamepad2, Briefcase, History, AlertCircle, Plus, Minus, RotateCcw, Zap } from 'lucide-react';

const App = () => {
  // Configuration: 1 hour of work = 1 hour of gaming
  const WORK_TO_GAME_RATIO = 1.0; 
  
  const [balance, setBalance] = useState(0); // Balance in minutes
  const [workInput, setWorkInput] = useState('');
  const [gameInput, setGameInput] = useState('');
  const [history, setHistory] = useState([]);

  // Load data from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem('gamepass_data');
    if (saved) {
      try {
        const { balance: savedBalance, history: savedHistory } = JSON.parse(saved);
        setBalance(savedBalance || 0);
        setHistory(savedHistory || []);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem('gamepass_data', JSON.stringify({ balance, history }));
  }, [balance, history]);

  const handleLogWork = (e) => {
    e.preventDefault();
    const hours = parseFloat(workInput);
    if (isNaN(hours) || hours <= 0) return;

    // Apply the 1:1 ratio
    const earnedMins = (hours * 60) * WORK_TO_GAME_RATIO;
    
    setBalance(prev => prev + earnedMins);
    addHistory('Work', earnedMins, 'increase');
    setWorkInput('');
  };

  const handleLogGame = (e) => {
    e.preventDefault();
    const hours = parseFloat(gameInput);
    if (isNaN(hours) || hours <= 0) return;

    const spentMins = hours * 60;

    setBalance(prev => prev - spentMins);
    addHistory('Gaming', spentMins, 'decrease');
    setGameInput('');
  };

  const addHistory = (type, amount, direction) => {
    const entry = {
      id: Date.now(),
      type,
      amount,
      direction,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHistory(prev => [entry, ...prev].slice(0, 10));
  };

  const resetData = () => {
    if (window.confirm("Are you sure you want to reset all data?")) {
      setBalance(0);
      setHistory([]);
      localStorage.removeItem('gamepass_data');
    }
  };

  const formatTime = (totalMinutes) => {
    const absMins = Math.round(Math.abs(totalMinutes));
    const h = Math.floor(absMins / 60);
    const m = absMins % 60;
    return `${totalMinutes < 0 ? '-' : ''}${h}h ${m}m`;
  };

  // Calculate "Charge" level for the UI (0 to 100%)
  // We assume a 10-hour "full" tank for visual representation
  const maxVisualCharge = 600; 
  const chargePercentage = Math.min(Math.max((balance / maxVisualCharge) * 100, -100), 100);
  const isNegative = balance < 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Gamepad2 size={28} />
              </div>
              GamePass <span className="text-indigo-400">Tracker</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-slate-400">Balance your grind and your play.</p>
              <span className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-tighter">
                <Zap size={10} /> 1:1 Rate
              </span>
            </div>
          </div>
          <button 
            onClick={resetData}
            className="p-2 text-slate-500 hover:text-red-400 transition-colors flex items-center gap-2 text-sm"
            title="Reset Data"
          >
            <RotateCcw size={18} />
            <span className="md:hidden">Reset Stats</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Accumulator Area */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* The Accumulator Card */}
            <div className={`relative overflow-hidden rounded-3xl border p-8 transition-colors duration-500 ${
              isNegative ? 'bg-red-950/20 border-red-500/30 shadow-[0_0_40px_-15px_rgba(239,68,68,0.3)]' : 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-widest text-slate-400 mb-1">
                    Available Gaming Time
                  </h2>
                  <div className={`text-6xl font-black tabular-nums tracking-tight ${isNegative ? 'text-red-500' : 'text-emerald-400'}`}>
                    {formatTime(balance)}
                  </div>
                </div>
                {isNegative && (
                  <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg shadow-red-500/20">
                    <AlertCircle size={14} />
                    OVERPLAYED
                  </div>
                )}
              </div>

              {/* Visual Meter */}
              <div className="h-10 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 relative">
                <div 
                  className={`h-full transition-all duration-1000 ease-out flex items-center justify-end px-4 ${
                    isNegative ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  }`}
                  style={{ width: `${Math.abs(chargePercentage)}%` }}
                >
                  <span className="text-[10px] font-black text-white/50 uppercase">
                    {Math.round(Math.abs(chargePercentage))}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                <span>0 Hours</span>
                <span>Rule: 1h Work = 1h Gaming</span>
                <span>10 Hours Limit</span>
              </div>
            </div>

            {/* Input Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Log Work */}
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4 text-emerald-400">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Briefcase size={20} />
                  </div>
                  <h3 className="font-semibold">Log Work</h3>
                </div>
                <form onSubmit={handleLogWork} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">Work Duration (Hours)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={workInput}
                      onChange={(e) => setWorkInput(e.target.value)}
                      placeholder="e.g. 2.0"
                      className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg font-medium"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Plus size={18} /> Add Time
                  </button>
                </form>
              </div>

              {/* Log Gaming */}
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4 text-indigo-400">
                   <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Gamepad2 size={20} />
                  </div>
                  <h3 className="font-semibold">Log Gaming</h3>
                </div>
                <form onSubmit={handleLogGame} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">Game Duration (Hours)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={gameInput}
                      onChange={(e) => setGameInput(e.target.value)}
                      placeholder="e.g. 1.0"
                      className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg font-medium"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Minus size={18} /> Spend Time
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Side History Panel */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 h-full backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <History size={20} className="text-indigo-400" />
                  <h3 className="font-semibold">Activity Log</h3>
                </div>
              </div>
              
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl gap-3">
                    <Clock size={32} strokeWidth={1} />
                    <p className="italic text-sm">Waiting for first log...</p>
                  </div>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="group flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all hover:translate-x-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.type === 'Work' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                          {item.type === 'Work' ? <Briefcase size={16} /> : <Gamepad2 size={16} />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{item.type}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-black">{item.timestamp}</div>
                        </div>
                      </div>
                      <div className={`font-bold tabular-nums ${item.direction === 'increase' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.direction === 'increase' ? '+' : '-'}{formatTime(item.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {history.length > 0 && (
                <p className="text-[10px] text-center text-slate-600 mt-6 uppercase tracking-[0.2em] font-bold">
                  Last 10 Records
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <footer className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-medium uppercase tracking-widest">
          <p>© 2024 GamePass Tracker</p>
          <div className="flex gap-6">
            <span>Work Hard</span>
            <span className="text-indigo-600">•</span>
            <span>Play Hard</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;