import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Check, Info, X, HelpCircle } from 'lucide-react';

interface ScoreVisualizerProps {
    score: number;
}

const THRESHOLDS = [
    { range: '95–100%', label: 'Platinum Trust', color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Highest safety tier. Verified official brands and flawless seller reputation.' },
    { range: '90–94%', label: 'Safe Product', color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Highly reliable. Standard marketplace protections and consistent positive sentiment.' },
    { range: '85–89%', label: 'Good (Minor Caution)', color: 'text-yellow-600', bg: 'bg-yellow-50', desc: 'Generally safe. Minor red flags like a newer seller or sparse review history.' },
    { range: '80–84%', label: 'Risky (Warning)', color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Proceed with caution. Inconsistent pricing or suspicious review phrasing detected.' },
    { range: '50–79%', label: 'High Risk', color: 'text-orange-800', bg: 'bg-orange-100', desc: 'Significant red flags found. Potential drop-shipping scam or review botting.' },
    { range: '0–49%', label: 'Likely Fake', color: 'text-red-600', bg: 'bg-red-50', desc: 'DANGER: High probability of a scam, phishing link, or counterfeit product.' },
];

export const ScoreGauge: React.FC<ScoreVisualizerProps> = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const [barWidth, setBarWidth] = useState(0);
    const [showGuide, setShowGuide] = useState(false);
    const guideRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setDisplayScore(0);
        setBarWidth(0);

        const timer = setTimeout(() => {
            setBarWidth(score);
        }, 100);

        let start = 0;
        const end = score;
        const duration = 1500;
        const startTime = performance.now();

        const animateNumber = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            setDisplayScore(Math.floor(start + (end - start) * ease));

            if (progress < 1) {
                requestAnimationFrame(animateNumber);
            }
        };
        
        requestAnimationFrame(animateNumber);

        return () => clearTimeout(timer);
    }, [score]);

    // Close guide when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (guideRef.current && !guideRef.current.contains(event.target as Node)) {
                setShowGuide(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    let config = {
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        bgLight: 'bg-emerald-50',
        icon: <ShieldCheck size={28} className="text-white" />,
        label: 'Safe Product',
        emoji: '🛡️✨',
        animationClass: '',
        advice: "Safe to buy. Verified seller and authentic reviews."
    };

    if (score >= 95) {
        config = {
            ...config,
            color: 'bg-emerald-500',
            animationClass: 'animate-pulse-glow',
            label: 'Excellent Trust',
            emoji: '🛡️✨',
            advice: "Highly trusted! This product passes all safety checks with flying colors.",
        };
    } else if (score >= 90) {
        config = {
            ...config,
            color: 'bg-emerald-500',
            animationClass: 'transition-all duration-700 ease-in-out',
            label: 'Safe Product',
            emoji: '✅😄',
        };
    } else if (score >= 85) {
        config = {
            color: 'bg-yellow-400',
            textColor: 'text-yellow-700',
            borderColor: 'border-yellow-200',
            bgLight: 'bg-yellow-50',
            icon: <ShieldCheck size={28} className="text-white" />,
            label: 'Good (Minor Caution)',
            emoji: '👍🙂',
            animationClass: 'animate-pulse-slow',
            advice: "Generally safe, but check recent reviews just in case."
        };
    } else if (score >= 80) {
        config = {
            color: 'bg-orange-400',
            textColor: 'text-orange-700',
            borderColor: 'border-orange-200',
            bgLight: 'bg-orange-50',
            icon: <AlertTriangle size={28} className="text-white" />,
            label: 'Risky (Warning)',
            emoji: '⚠️🤔',
            animationClass: 'animate-shake-subtle',
            advice: "Proceed with caution. Some mixed signals detected."
        };
    } else if (score >= 50) {
        config = {
            color: 'bg-orange-600',
            textColor: 'text-orange-800',
            borderColor: 'border-orange-300',
            bgLight: 'bg-orange-100',
            icon: <AlertTriangle size={28} className="text-white" />,
            label: 'High Risk',
            emoji: '🚨😟',
            animationClass: 'animate-pulse',
            advice: "Not recommended. Significant red flags found."
        };
    } else {
        config = {
            color: 'bg-red-600',
            textColor: 'text-red-700',
            borderColor: 'border-red-200',
            bgLight: 'bg-red-50',
            icon: <AlertOctagon size={28} className="text-white" />,
            label: 'Likely Fake',
            emoji: '❌☠️',
            animationClass: 'animate-shake-strong',
            advice: "DANGER: Do not buy. High probability of being a scam."
        };
    }

    return (
        <div className={`w-full max-w-md mx-auto relative ${config.animationClass}`}>
            
            {/* Header: Score & Label */}
            <div className="flex items-end justify-between mb-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 animate-enter-smooth">Trust Score</span>
                    <div className="flex items-center gap-2 md:gap-3">
                        <h3 className={`text-4xl md:text-5xl font-extrabold ${config.textColor} tracking-tight tabular-nums transition-colors duration-500`}>
                            {displayScore}%
                        </h3>
                        <span 
                            className={`text-3xl md:text-4xl filter drop-shadow-sm animate-float cursor-help transition-all duration-700 transform ${displayScore > 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} 
                            title={config.label}
                        >
                            {config.emoji}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 relative">
                    <button 
                        onClick={() => setShowGuide(!showGuide)}
                        className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50 group"
                        title="View Score Legend"
                    >
                        <HelpCircle size={18} className="group-hover:scale-110 transition-transform" />
                    </button>

                    <div className={`px-4 py-1.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 ${config.bgLight} ${config.textColor} border ${config.borderColor} mb-2 animate-enter-smooth shadow-sm`} style={{ animationDelay: '0.2s' }}>
                        {score >= 85 ? <Check size={14} className="md:w-4 md:h-4" /> : <Info size={14} className="md:w-4 md:h-4" />}
                        <span className="whitespace-nowrap">{config.label}</span>
                    </div>

                    {/* Threshold Guide Popover */}
                    {showGuide && (
                        <div 
                            ref={guideRef}
                            className="absolute top-12 right-0 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-[100] animate-scale-in origin-top-right ring-1 ring-slate-950/5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Trust Level Guide</h4>
                                <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                            </div>
                            <div className="space-y-4">
                                {THRESHOLDS.map((t, idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${t.bg} ${t.color}`}>{t.range}</span>
                                            <span className={`text-[11px] font-bold ${t.color}`}>{t.label}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-tight pl-1">{t.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 text-[9px] text-slate-400 font-medium italic">
                                *Scores are generated by comparing real-time patterns with known fraud signatures.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Visual Bar */}
            <div className="h-4 md:h-6 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200 relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
                
                <div 
                    className={`h-full ${config.color} rounded-full shadow-lg relative transition-all duration-[1500ms] ease-premium-ease flex items-center justify-end pr-2`}
                    style={{ width: `${barWidth}%` }}
                >
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/30 blur-[2px]"></div>
                </div>
            </div>

            {/* User Advice Micro-interaction */}
            <div className="mt-6 flex items-start gap-4 bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:bg-white animate-enter-smooth" style={{ animationDelay: '0.4s' }}>
                <div className={`p-3 rounded-xl ${config.color} shadow-lg text-white transition-colors duration-500`}>
                    {config.icon}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                        AI Verdict
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">{config.advice}</p>
                </div>
            </div>
        </div>
    );
};