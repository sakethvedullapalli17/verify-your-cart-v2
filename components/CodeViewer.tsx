import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode } from 'lucide-react';

// Actual code used in the app
const codeFiles = {
  'analysisService.ts': `import { GoogleGenAI } from "@google/genai";

export const analyzeProduct = async (url: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Define tools for real-time verification
  const tools = [{ googleSearch: {} }];

  const prompt = \`Analyze this product URL: \${url}
  Verify price realism and seller reputation.
  Return JSON format.\`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: tools,
      responseMimeType: "application/json",
      // ... schema definition
    }
  });

  return JSON.parse(response.text);
};`,

  'useGemini.ts': `// Example of React Hook for AI
const useAnalyze = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const scan = async (url) => {
    setLoading(true);
    try {
      const data = await analyzeProduct(url);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return { scan, loading, result };
};`
};

export const CodeViewer: React.FC = () => {
    const [activeFile, setActiveFile] = useState<keyof typeof codeFiles>('analysisService.ts');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeFiles[activeFile]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto h-[600px] flex flex-col">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Frontend AI Implementation</h2>
                <p className="text-slate-600 mt-2">
                    Review the actual TypeScript code powering this application. 
                    No backend servers involved—just pure Client-to-API communication.
                </p>
            </div>

            <div className="flex-grow flex border border-slate-200 rounded-xl overflow-hidden shadow-2xl bg-[#1e1e1e] ring-4 ring-slate-100">
                {/* Sidebar */}
                <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
                    <div className="p-4 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-[#3e3e42]">
                        <Terminal size={14} /> Explorer
                    </div>
                    {Object.keys(codeFiles).map((filename) => (
                        <button
                            key={filename}
                            onClick={() => setActiveFile(filename as any)}
                            className={`px-4 py-3 text-sm text-left font-mono transition-colors flex items-center gap-2 ${
                                activeFile === filename 
                                    ? 'bg-[#37373d] text-blue-300 border-l-2 border-blue-500' 
                                    : 'text-slate-400 hover:text-white hover:bg-[#2a2d2e] border-l-2 border-transparent'
                            }`}
                        >
                            <FileCode size={14} />
                            {filename}
                        </button>
                    ))}
                </div>

                {/* Code Area */}
                <div className="flex-grow flex flex-col min-w-0">
                    <div className="h-12 bg-[#1e1e1e] border-b border-[#3e3e42] flex items-center justify-between px-6">
                        <span className="text-slate-400 text-xs font-mono">{activeFile}</span>
                        <button 
                            onClick={handleCopy}
                            className="text-slate-400 hover:text-white flex items-center gap-2 text-xs transition-colors hover:bg-white/10 px-2 py-1 rounded"
                        >
                            {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy Code'}
                        </button>
                    </div>
                    <div className="flex-grow overflow-auto p-6 custom-scrollbar">
                        <pre className="text-sm font-mono leading-relaxed">
                            <code className="text-[#9cdcfe]">
                                {codeFiles[activeFile]}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};