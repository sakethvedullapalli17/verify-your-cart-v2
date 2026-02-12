import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ShieldCheck, Shield, Zap, Lock, Globe, Database, Lightbulb, Sparkles, Star, BrainCircuit, DollarSign, Store, FileText, ExternalLink, Info, Key, MessageSquareText } from 'lucide-react';
import { AnalysisResult } from '../types';
import { analyzeProduct } from '../services/analysisService';
import { ScoreGauge } from './ScoreGauge';
import { BrandLogo } from './BrandLogo';

export const Analyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [needsKey, setNeedsKey] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (result && !loading && resultRef.current) {
      setTimeout(() => {
        const yOffset = -120;
        const element = resultRef.current;
        if (element) {
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [result, loading]);

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
      setError('');
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = `https://${processedUrl}`;
    }

    if (!processedUrl.includes('.')) {
        setError('Please enter a valid URL (e.g., amazon.com/product...)');
        return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeProduct(processedUrl);
      setResult(data);
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg.includes('permission') || errMsg.includes('key')) {
        setNeedsKey(true);
        setError('Permission denied. A paid API key might be required for this model.');
      } else {
        setError('Analysis failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getDisplayVerdict = (verdict: string) => {
    switch (verdict) {
        case 'Genuine': return { text: 'Safe Product', icon: <CheckCircle className="w-5 h-5"/>, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' };
        case 'Fake': return { text: 'Likely Fake Product', icon: <AlertTriangle className="w-5 h-5"/>, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
        default: return { text: 'Risky Product', icon: <ShieldCheck className="w-5 h-5"/>, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
    }
  };

  return (
    <div className="relative pt-24 pb-12 lg:pt-48 lg:pb-32 overflow-hidden transition-all duration-700">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
          
          <div className="animate-float mb-2">
            <div className="relative inline-flex items-center justify-center group cursor-default">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse-slow rounded-full"></div>
                <div className="bg-gradient-to-br from-white to-blue-50 p-4 md:p-5 rounded-[2rem] shadow-2xl border border-white/50 relative transform transition-transform duration-500 group-hover:scale-105">
                    <ShieldCheck size={40} className="text-blue-600 md:w-12 md:h-12 animate-pulse-shield" />
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 p-1.5 rounded-full border-2 border-white shadow-lg">
                        <Sparkles size={10} className="text-white animate-spin-slow" />
                    </div>
                </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl animate-fade-in-up flex flex-col items-center justify-center">
            <span className="mb-1 md:mb-2">Verify Your</span>
            <div className="h-12 sm:h-16 md:h-32 w-full flex justify-center">
                <BrandLogo className="h-full w-auto" variant="dark" />
            </div>
          </h1>

          <p className="text-lg md:text-2xl font-bold text-slate-700 mt-2 animate-fade-in-up">
            Check it right. Buy it bright.
          </p>

          <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in-up">
            <form onSubmit={handleAnalyze} className="relative group z-20">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500 pointer-events-none"></div>
              
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2 transition-all duration-300 focus-within:ring-4 focus-within:ring-blue-500/20">
                <div className="pl-4 text-slate-400">
                  <Globe size={20} className="group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="product-url-input"
                  ref={inputRef}
                  type="text"
                  placeholder="Paste product URL (Amazon, Flipkart, etc)..."
                  className="w-full px-4 py-4 text-base md:text-lg bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-800 font-medium"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                
                <button
                  type="submit"
                  disabled={loading || !url}
                  className={`hidden md:flex relative items-center justify-center rounded-xl font-bold text-white transition-all duration-300 transform overflow-hidden ${
                    loading 
                      ? 'bg-transparent cursor-wait scale-95' 
                      : 'bg-slate-900 hover:bg-blue-600 shadow-lg px-8 py-3.5'
                  }`}
                >
                  {loading ? (
                      <div className="relative w-full h-full flex items-center justify-center z-10">
                        <span className="animate-pulse">Analyzing...</span>
                      </div>
                  ) : "Scan Now"}
                </button>
              </div>

              <button
                  type="submit"
                  disabled={loading || !url}
                  className={`relative z-10 mt-4 w-full md:hidden flex justify-center items-center rounded-2xl font-bold text-white py-4 transition-all duration-300 shadow-xl active:scale-95 ${
                    loading ? 'bg-slate-900 animate-pulse' : 'bg-blue-600 shadow-lg active:shadow-inner'
                  }`}
                >
                  {loading ? "Analyzing..." : "Scan Now"}
              </button>
            </form>
            
            {needsKey && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between animate-fade-in relative z-20">
                <div className="flex items-center gap-3 text-amber-800 text-sm font-medium">
                  <Key size={18} />
                  <span>Connect your AI Studio key.</span>
                </div>
                <button 
                  onClick={handleSelectKey}
                  className="px-4 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Setup Key
                </button>
              </div>
            )}

            {error && !needsKey && (
                <div className="mt-4 bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-shake-strong border border-red-100 shadow-sm relative z-20">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}
          </div>
        </div>

        {loading && (
             <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                 <div className="relative mb-6">
                     <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                         <Globe size={24} className="text-blue-500 animate-pulse" />
                     </div>
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Engaging Forensic AI...</h3>
                 <p className="text-slate-500 text-sm text-center max-w-md">
                    Performing deep NLP review analysis and heuristic URL verification.
                 </p>
             </div>
        )}

        {result && !loading && (
          <div ref={resultRef} className="animate-scale-in transform transition-all origin-top duration-700 ease-out">
            <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/50 mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200/50">
                <div className="md:col-span-5 p-8 md:p-12 flex flex-col items-center bg-slate-50/50">
                    <ScoreGauge score={result.trust_score} />
                    <div className="mt-8 text-center w-full">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">AI Verdict</p>
                        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border ${getDisplayVerdict(result.verdict).bg} ${getDisplayVerdict(result.verdict).border} ${getDisplayVerdict(result.verdict).color}`}>
                           {getDisplayVerdict(result.verdict).icon}
                           <span className="text-lg font-bold">{getDisplayVerdict(result.verdict).text}</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-7 p-8 md:p-12 bg-white">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shadow-inner">
                            <BrainCircuit size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-xl">Forensic Analysis</h3>
                            <p className="text-xs text-slate-500 font-medium">Thinking-enabled reasoning engine</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-8">
                        {/* New: Advanced NLP Insights */}
                        {result.nlp_insights && result.nlp_insights.length > 0 && (
                          <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 animate-enter-smooth" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center gap-3 mb-2 text-indigo-600">
                                <MessageSquareText size={18} />
                                <h4 className="font-bold text-sm">Sophisticated NLP Insights</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {result.nlp_insights.map((insight, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white border border-indigo-100 rounded-full text-[10px] md:text-xs font-bold text-indigo-700 shadow-sm">
                                  {insight}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.breakdown?.reviews && (
                            <BreakdownCard 
                                icon={<Star size={16} />} 
                                title="Linguistic Review Analysis" 
                                items={result.breakdown.reviews}
                                color="violet"
                                delay={0.2}
                            />
                        )}
                        {result.breakdown?.price && (
                             <BreakdownCard 
                                icon={<DollarSign size={16} />} 
                                title="Economic Feasibility" 
                                items={result.breakdown.price}
                                color="emerald"
                                delay={0.4}
                            />
                        )}
                        {result.breakdown?.seller && (
                             <BreakdownCard 
                                icon={<Store size={16} />} 
                                title="Identity Verification" 
                                items={result.breakdown.seller}
                                color="orange"
                                delay={0.5}
                            />
                        )}
                    </div>

                    <div className="bg-slate-900 p-6 rounded-2xl text-white relative overflow-hidden group">
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="bg-white/10 p-2.5 rounded-full text-yellow-300">
                                <Lightbulb size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Recommendation</h4>
                                <p className="text-slate-100 text-sm md:text-base leading-relaxed font-medium">
                                    {result.advice}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 border-t border-slate-200/50 text-[10px] text-slate-400 font-semibold px-12 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                      <Lock size={12} />
                      Chain-of-thought analysis complete. Verify independently.
                  </div>
                  {result.sources && result.sources.length > 0 && (
                      <div className="flex items-center gap-2 text-blue-600">
                          <ExternalLink size={12} />
                          Search Evidence: {result.sources.map(s => new URL(s).hostname.replace('www.','')).join(', ')}
                      </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BreakdownCard: React.FC<{ icon: React.ReactNode; title: string; items: string[]; color: string; delay: number }> = ({ icon, title, items, color, delay }) => {
    const colorClasses: any = {
        violet: 'text-violet-600 bg-violet-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        orange: 'text-orange-600 bg-orange-50',
        blue: 'text-blue-600 bg-blue-50',
    };
    
    return (
        <div 
            className="group rounded-xl border border-slate-100 bg-white p-4 hover:shadow-md transition-all duration-300 opacity-0 animate-enter-smooth"
            style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
        >
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
            </div>
            <ul className="space-y-1.5 ml-1">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-slate-600 font-medium">
                         <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-slate-300 group-hover:bg-blue-400 transition-colors"></span>
                         <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}