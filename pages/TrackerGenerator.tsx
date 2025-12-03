import React, { useState } from 'react';
import { generateTrackingId, saveEmail } from '../services/storageService';
import { optimizeSubjectLine } from '../services/geminiService';
import { Copy, Check, Sparkles, AlertCircle, Zap, AlertTriangle } from 'lucide-react';

export const TrackerGenerator: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // AI States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  const generateCode = async (recipientVal: string, subjectVal: string) => {
    setIsGenerating(true);
    setSaveError(null);
    
    const trackingId = generateTrackingId();
    // If no values provided, use placeholders
    const finalRecipient = recipientVal || 'Belirtilmedi';
    const finalSubject = subjectVal || `Hızlı Takip - ${new Date().toLocaleTimeString('tr-TR')}`;

    const newEmail = {
      id: '', // DB will assign UUID
      recipient: finalRecipient,
      subject: finalSubject,
      createdAt: new Date().toISOString(),
      openedAt: null,
      status: 'sent' as const,
      trackingId
    };

    const result = await saveEmail(newEmail);
    
    if (!result.success) {
      setSaveError(result.error || 'Veritabanına kayıt yapılamadı.');
      setIsGenerating(false);
      return null;
    }

    setIsGenerating(false);

    // REAL Supabase Edge Function URL
    // Project Ref: jnlbhiyazvexttfpuxxe
    const trackingUrl = `https://jnlbhiyazvexttfpuxxe.supabase.co/functions/v1/track?id=${trackingId}`;
    const htmlCode = `<img src="${trackingUrl}" width="1" height="1" alt="" style="display:none;" />`;
    
    setGeneratedCode(htmlCode);
    return htmlCode;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateCode(recipient, subject);
  };

  const handleQuickGenerate = async () => {
    // Generate code with empty values instantly
    const code = await generateCode('', '');
    
    if (code) {
      // Auto copy
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAiOptimize = async () => {
    if (!subject) return;
    setAiLoading(true);
    const result = await optimizeSubjectLine(subject);
    setAiSuggestions(result);
    setAiLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Takip Kodu Oluştur</h1>
        <p className="text-gray-500 mt-1">İster hızlıca kod alıp çıkın, ister detaylı kayıt oluşturun.</p>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Kayıt Hatası:</p>
            <p className="text-sm">{saveError}</p>
            <p className="text-xs mt-2 text-red-500">Lütfen Dashboard sayfasındaki SQL kodlarını Supabase'de çalıştırdığınızdan emin olun.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Action Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap size={24} className="text-yellow-300" />
              </div>
              <h2 className="text-xl font-bold">Hızlı Oluştur & Kopyala</h2>
            </div>
            <p className="text-indigo-100 mb-6 text-sm">
              Alıcı bilgisi girmekle vakit kaybetmeyin. Tek tıkla kodu kopyalayın, e-postanıza yapıştırın. Bilgileri sonra listeden düzenleyebilirsiniz.
            </p>
            
            <button
              onClick={handleQuickGenerate}
              disabled={isGenerating}
              className="w-full bg-white text-indigo-700 font-bold py-4 rounded-lg hover:bg-indigo-50 transition-colors shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : copied ? (
                <>
                  <Check size={20} /> Kopyalandı!
                </>
              ) : (
                <>
                  <Copy size={20} /> Kod Üret ve Kopyala
                </>
              )}
            </button>
          </div>
          
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
        </div>

        {/* Detailed Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
           <h2 className="text-lg font-bold text-gray-900 mb-4">Detaylı Oluşturma</h2>
           <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Alıcı E-Posta / İsim (İsteğe bağlı)</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Örn: Ahmet Bey"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Konu Başlığı (İsteğe bağlı)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Örn: Teklif Dosyası"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={handleAiOptimize}
                  disabled={!subject || aiLoading}
                  className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                  title="AI ile Başlık Önerisi Al"
                >
                  {aiLoading ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gray-900 text-white font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm flex justify-center items-center"
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Kodu Oluştur"}
            </button>
          </form>
        </div>
      </div>

      {/* AI Suggestions Result */}
      {aiSuggestions && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-sm animate-fade-in">
            <p className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Sparkles size={14} /> Gemini Önerileri:
            </p>
            <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-600 bg-transparent border-none p-0 m-0">
                {aiSuggestions}
            </pre>
            </div>
        </div>
      )}

      {/* Generated Code Display */}
      {generatedCode && (
        <div className="mt-6 pt-6 border-t border-gray-100 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Takip Kodu (HTML)</h3>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Kullanıma Hazır</span>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 relative group">
            <code className="text-gray-300 text-sm break-all font-mono block pr-10">
              {generatedCode}
            </code>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-all"
              title="Kopyala"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold mb-1">Kurulum Hatırlatması:</p>
              <p>
                Bu kodun çalışması için <strong>Supabase Edge Function</strong> dağıtımını yapmanız gerekmektedir. 
                Siz fonksiyonu deploy edene kadar bu linkler çalışmayacaktır.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};