import React, { useEffect, useState } from 'react';
import { getStats, getEmails, subscribeToChanges } from '../services/storageService';
import { Stats, TrackedEmail } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MailOpen, Send, TrendingUp, Clock, RefreshCw, AlertTriangle, Database } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ totalSent: 0, totalOpened: 0, openRate: 0 });
  const [recentEmails, setRecentEmails] = useState<TrackedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSql, setShowSql] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, emailsData] = await Promise.all([
        getStats(),
        getEmails()
      ]);
      setStats(statsData);
      setRecentEmails(emailsData.slice(0, 5));
    } catch (error) {
      console.error("Data load failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for any changes in the database (Insert/Update/Delete)
    const unsubscribe = subscribeToChanges(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const chartData = [
    { name: 'Gönderilen', value: stats.totalSent },
    { name: 'Okunan', value: stats.totalOpened },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-400 mt-2">{subtext}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontrol Paneli</h1>
          <p className="text-gray-500 mt-1">E-posta takip performansınızın genel özeti (Canlı Veri).</p>
        </div>
        <div className="flex gap-2">
            <button 
            onClick={() => setShowSql(!showSql)}
            className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 text-indigo-700 transition-colors flex items-center gap-2"
            title="SQL Kurulum Kodları"
            >
            <Database size={20} /> <span className="text-sm font-semibold">DB Kurulum</span>
            </button>
            <button 
            onClick={loadData}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            title="Yenile"
            >
            <RefreshCw size={20} />
            </button>
        </div>
      </div>

      {showSql && (
         <div className="bg-slate-800 rounded-xl p-6 text-slate-200 border border-slate-700 shadow-xl relative animate-slide-up">
           <button onClick={() => setShowSql(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">Kapat</button>
           <div className="flex items-center gap-3 mb-4">
             <AlertTriangle className="text-yellow-400" />
             <h3 className="font-bold text-lg text-white">Supabase SQL Editor Kodu</h3>
           </div>
           <p className="mb-4 text-sm text-slate-300">
             Sistemin hatasız çalışması ve canlı takibin (realtime) aktif olması için aşağıdaki kodu kopyalayıp Supabase SQL Editor'de çalıştırın:
           </p>
           <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-xs font-mono text-green-400 select-all border border-slate-700">
{`-- 1. Realtime Yayınını Temizle ve Oluştur
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- 2. Tabloyu Oluştur (Eğer yoksa)
CREATE TABLE IF NOT EXISTS public.tracked_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id TEXT NOT NULL UNIQUE,
    recipient TEXT,
    subject TEXT,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE
);

-- 3. RLS (Güvenlik) Ayarlarını Yapılandır
ALTER TABLE public.tracked_emails ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (Çakışmayı önlemek için)
DROP POLICY IF EXISTS "Public Access Select" ON public.tracked_emails;
DROP POLICY IF EXISTS "Public Access Insert" ON public.tracked_emails;
DROP POLICY IF EXISTS "Public Access Update" ON public.tracked_emails;
DROP POLICY IF EXISTS "Public Access Delete" ON public.tracked_emails;

-- Herkese tam yetki ver (Demo için)
CREATE POLICY "Public Access Select" ON public.tracked_emails FOR SELECT USING (true);
CREATE POLICY "Public Access Insert" ON public.tracked_emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Access Update" ON public.tracked_emails FOR UPDATE USING (true);
CREATE POLICY "Public Access Delete" ON public.tracked_emails FOR DELETE USING (true);

-- 4. Tabloyu Realtime Yayınına Ekle
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracked_emails;`}
           </pre>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Toplam Gönderilen" 
          value={stats.totalSent} 
          icon={Send} 
          color="bg-blue-500"
          subtext="Takip edilen tüm e-postalar"
        />
        <StatCard 
          title="Toplam Okunan" 
          value={stats.totalOpened} 
          icon={MailOpen} 
          color="bg-green-500" 
          subtext={`${stats.totalOpened} e-posta açıldı`}
        />
        <StatCard 
          title="Okunma Oranı" 
          value={`%${stats.openRate}`} 
          icon={TrendingUp} 
          color="bg-indigo-500" 
          subtext="Gönderilen/Okunan oranı"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Etkileşim Grafiği</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#10B981'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Son Aktiviteler</h3>
          <div className="space-y-4">
            {recentEmails.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Henüz veri yok.</p>
            ) : (
              recentEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${email.status === 'opened' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{email.subject}</p>
                      <p className="text-xs text-gray-500">{email.recipient}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock size={12} className="mr-1" />
                    {email.status === 'opened' && email.openedAt
                      ? new Date(email.openedAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})
                      : 'Bekleniyor'
                    }
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};