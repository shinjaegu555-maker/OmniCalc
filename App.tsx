
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { solveComplexMath } from './services/geminiService';
import { Calculation } from './types';
import { 
  Calculator as CalculatorIcon, 
  History as HistoryIcon, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  Keyboard,
  Info
} from 'lucide-react';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [livePreview, setLivePreview] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll to bottom of history
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Simple local evaluator for instant feedback
  const evaluateLocal = (val: string) => {
    if (!val.trim()) return null;
    try {
      // Basic sanitization and evaluation for simple expressions
      // We only allow math characters for the instant preview
      if (!/^[0-9+\-*/().\s]+$/.test(val)) return null;
      
      // eslint-disable-next-line no-eval
      const result = eval(val);
      if (typeof result === 'number' && !isNaN(result)) {
        return result.toString();
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const preview = evaluateLocal(input);
    setLivePreview(preview);
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query) return;

    setIsLoading(true);
    setInput('');
    
    let result = '';
    let isAi = false;

    // Determine if we should use local eval or AI
    const localResult = evaluateLocal(query);
    if (localResult !== null) {
      result = localResult;
    } else {
      isAi = true;
      result = await solveComplexMath(query);
    }

    const newCalc: Calculation = {
      id: Math.random().toString(36).substr(2, 9),
      query,
      result,
      timestamp: Date.now(),
      isAiResponse: isAi
    };

    setHistory(prev => [...prev, newCalc]);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const usePastQuery = (query: string) => {
    setInput(query);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <CalculatorIcon className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">OmniCalc</h1>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Intelligent One-Line</p>
          </div>
        </div>
        
        <button 
          onClick={clearHistory}
          className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
          title="Clear History"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      {/* Main Display & History Area */}
      <main className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* History Feed */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 opacity-50">
              <HistoryIcon className="w-12 h-12" />
              <div className="text-center">
                <p className="text-sm font-medium">Your calculations will appear here</p>
                <p className="text-xs mt-1">Try "24 * 7" or "15% of $1200"</p>
              </div>
            </div>
          ) : (
            history.map((calc) => (
              <div 
                key={calc.id} 
                className="animate-fade-in group"
              >
                <div className="flex items-start justify-between mb-1">
                  <button 
                    onClick={() => usePastQuery(calc.query)}
                    className="text-zinc-400 text-sm hover:text-indigo-400 transition-colors mono cursor-pointer"
                  >
                    {calc.query}
                  </button>
                  <span className="text-[10px] text-zinc-600 uppercase mono">
                    {new Date(calc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 p-4 rounded-2xl bg-zinc-900 border ${calc.isAiResponse ? 'border-indigo-500/30' : 'border-zinc-800'} relative overflow-hidden`}>
                    {calc.isAiResponse && (
                      <div className="absolute top-0 right-0 p-2 opacity-30">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                      </div>
                    )}
                    <p className="text-lg font-semibold mono text-zinc-100 break-words leading-tight">
                      {calc.result}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={historyEndRef} />
        </div>

        {/* Input Control Section */}
        <div className="relative pt-6">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Keyboard className="w-5 h-5 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
              )}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your calculation..."
              className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-indigo-500 text-white pl-14 pr-16 py-5 rounded-3xl outline-none transition-all text-xl mono shadow-2xl shadow-black/50"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all shadow-lg active:scale-95"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Real-time Preview */}
          {livePreview && (
            <div className="absolute -top-4 left-14 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full mono tracking-wider animate-fade-in shadow-xl shadow-indigo-500/40">
              PREVIEW: {livePreview}
            </div>
          )}

          {/* Quick Info / Hints */}
          <div className="flex items-center gap-4 mt-4 px-2">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
              <Info className="w-3 h-3" />
              <span>Use natural language for complex queries</span>
            </div>
            <div className="flex-1 h-px bg-zinc-800/50" />
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-zinc-800/50 text-zinc-400 rounded text-[10px] mono">Enter to solve</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-8 pt-4 border-t border-zinc-900 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
          Powered by Gemini 3 Flash &middot; Professional Series
        </p>
      </footer>
    </div>
  );
};

export default App;
