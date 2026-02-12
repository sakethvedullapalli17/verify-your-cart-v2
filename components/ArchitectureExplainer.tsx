import React from 'react';
import { CloudLightning, Zap, BrainCircuit, Globe, Search, ShieldCheck } from 'lucide-react';

export const ArchitectureExplainer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800">Serverless Architecture</h2>
        <p className="text-slate-600 mt-2">How TrustLens operates entirely in your browser using Gemini API.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 relative">
        {/* Connector Line */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 -z-10 -translate-y-1/2"></div>
        
        <ArchitectureCard 
            icon={<Globe className="text-blue-500" />} 
            title="1. Client" 
            desc="React SPA hosted on Edge" 
        />
        <ArchitectureCard 
            icon={<CloudLightning className="text-indigo-500" />} 
            title="2. Gemini API" 
            desc="Direct call via Google GenAI SDK" 
        />
        <ArchitectureCard 
            icon={<Search className="text-purple-500" />} 
            title="3. Grounding" 
            desc="Real-time Google Search Validation" 
        />
        <ArchitectureCard 
            icon={<ShieldCheck className="text-emerald-500" />} 
            title="4. Verdict" 
            desc="JSON Analysis returned to UI" 
        />
      </div>

      <div className="space-y-6">
        <Section title="Why Frontend-Only?">
            <p className="text-slate-600 mb-4">
                By leveraging the <strong>Gemini 3 Flash</strong> model directly from the client, we eliminate the need for traditional backend servers. This reduces latency and improves privacy as data is processed ephemerally.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureBox title="Old Way (Legacy)" items={[
                    "Python/Flask Server required",
                    "Complex Web Scraping (BeautifulSoup)",
                    "IP Blocking issues",
                    "Slow Response Times (>5s)"
                ]} />
                <FeatureBox title="New Way (TrustLens AI)" items={[
                    "Serverless (run anywhere)",
                    "Native Google Search Grounding",
                    "Zero maintenance overhead",
                    "Instant 'Thinking' Analysis"
                ]} />
            </div>
        </Section>

        <Section title="AI Reasoning Engine">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-2">Model: Gemini 3 Flash Preview</h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    We utilize the model's <strong>Tool Use</strong> capabilities to perform live "Grounding". When you submit a URL, the AI doesn't just guess; it searches Google for that specific product to see if the price and seller reputation match reality.
                </p>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">@google/genai</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">React 19</span>
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">Vite</span>
                </div>
            </div>
        </Section>
      </div>
    </div>
  );
};

const ArchitectureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 z-10">
        <div className="mb-3 p-3 bg-slate-50 rounded-full shadow-inner">{icon}</div>
        <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-3">
        <h3 className="text-xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">{title}</h3>
        {children}
    </div>
);

const FeatureBox: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
        <h4 className="font-semibold text-slate-700 mb-3">{title}</h4>
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className={`w-1.5 h-1.5 rounded-full ${title.includes('New') ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    {item}
                </li>
            ))}
        </ul>
    </div>
);