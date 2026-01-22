
import React, { useState, useRef } from 'react';
import { Camera, Send, Info, Sparkles, AlertCircle, Trash2, Image as ImageIcon, Plus } from 'lucide-react';
import { SCAM_CATEGORIES, PLATFORMS } from '../constants';
import { ScamReport } from '../types';
import { analyzeReport } from '../services/geminiService';

interface ReportFormProps {
  onSubmit: (report: Partial<ScamReport>) => void;
  isSubmitting: boolean;
}

const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: SCAM_CATEGORIES[0],
    platform: PLATFORMS[0],
    scammerName: '',
    scammerContact: '',
    whatsappNumber: '',
    reporterEmail: '',
    description: '',
  });
  const [proofs, setProofs] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Constraints: Min 500, Max 2000
          const minSize = 500;
          const maxSize = 2000;

          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }

          if (width < minSize || height < minSize) {
            const ratio = Math.max(minSize / width, minSize / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality to save space
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Explicitly type 'file' as 'File' in the map function to resolve the 'unknown' type assignment error.
    const processedImages = await Promise.all(
      Array.from(files).map((file: File) => resizeImage(file))
    );

    setProofs(prev => [...prev, ...processedImages]);
  };

  const removeProof = (index: number) => {
    setProofs(prev => prev.filter((_, i) => i !== index));
  };

  const handleAiAnalysis = async () => {
    if (formData.description.length < 20) {
      alert("Please provide a more detailed description for AI analysis.");
      return;
    }
    setAnalyzing(true);
    const analysis = await analyzeReport(formData.description, formData.category);
    setAiAnalysis(analysis);
    setAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      riskLevel: aiAnalysis?.riskLevel || 'medium',
      aiSummary: aiAnalysis?.summary || '',
      proofUrls: proofs,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-3xl mx-auto mb-10">
      <div className="bg-indigo-600 px-8 py-10 text-white">
        <h2 className="text-3xl font-extrabold mb-2">Report a Scammer</h2>
        <p className="text-indigo-100 opacity-90">Your submission helps protect the community from fraud.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Subject / Headline</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. WhatsApp Investment Fraud"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Category</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              {SCAM_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Platform</label>
            <select 
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Scammer Alias</label>
            <input 
              name="scammerName"
              value={formData.scammerName}
              onChange={handleChange}
              placeholder="Display name"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Contact / Handle</label>
            <input 
              name="scammerContact"
              value={formData.scammerContact}
              onChange={handleChange}
              placeholder="Username or email"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
               WhatsApp Number 
               <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 rounded uppercase font-black">Verify Option</span>
            </label>
            <input 
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              placeholder="+8801..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Reporter Email (Optional)</label>
            <input 
              name="reporterEmail"
              value={formData.reporterEmail}
              onChange={handleChange}
              placeholder="For follow-up"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Description (Modus Operandi)</label>
          <textarea 
            required
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain exactly how the scam works..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
            Evidence Images (Max 2000px)
            <span className="text-xs text-slate-400 font-normal">Click to upload or drag & drop</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
             {proofs.map((src, i) => (
               <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                  <img src={src} alt="Proof" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeProof(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
               </div>
             ))}
             <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all gap-1"
             >
                <Plus className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase">Add Photo</span>
             </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
            accept="image/*" 
          />
        </div>

        {aiAnalysis && (
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-indigo-900 text-sm mb-1 flex items-center gap-2">
                AI Assessment 
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${aiAnalysis.riskLevel === 'high' || aiAnalysis.riskLevel === 'critical' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>
                  {aiAnalysis.riskLevel} Risk
                </span>
              </h4>
              <p className="text-sm text-indigo-800 italic">"{aiAnalysis.summary}"</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <button 
            type="button"
            onClick={handleAiAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {analyzing ? 'Checking Database...' : 'Run Pattern Analysis'}
          </button>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            {isSubmitting ? 'Compressing...' : 'Submit Report'}
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
