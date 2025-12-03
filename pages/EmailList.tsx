import React, { useState, useEffect } from 'react';
import { getEmails, deleteEmail, markAsOpened, updateEmail, subscribeToChanges } from '../services/storageService';
import { TrackedEmail } from '../types';
import { Trash2, ExternalLink, Search, Mail, MailOpen, Edit2, Check, X, RefreshCw } from 'lucide-react';

export const EmailList: React.FC = () => {
  const [emails, setEmails] = useState<TrackedEmail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{recipient: string, subject: string}>({ recipient: '', subject: '' });

  const loadEmails = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getEmails();
      setEmails(data);
    } catch (error) {
      console.error("Failed to load emails", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails(true);

    // Real-time listener for list updates
    const unsubscribe = subscribeToChanges(() => {
      loadEmails(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Bu takibi silmek istediğinize emin misiniz?')) {
      // Optimistic delete
      setEmails(prev => prev.filter(e => e.id !== id));
      await deleteEmail(id);
    }
  };

  const handleSimulateOpen = async (id: string) => {
    // 1. Optimistic Update (Immediate Feedback)
    const now = new Date().toISOString();
    setEmails(prev => prev.map(e => 
      e.id === id ? { ...e, status: 'opened', openedAt: now } : e
    ));

    // 2. Perform DB Update
    const error = await markAsOpened(id);
    
    // 3. Revert if error
    if (error) {
       alert("Simülasyon hatası: " + error);
       loadEmails(false); // Reload from DB to revert
    }
  };

  const startEditing = (email: TrackedEmail) => {
    setEditingId(email.id);
    setEditForm({ recipient: email.recipient, subject: email.subject });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ recipient: '', subject: '' });
  };

  const saveEditing = async (id: string) => {
    // Optimistic Update
    setEmails(prev => prev.map(e => 
        e.id === id ? { ...e, recipient: editForm.recipient, subject: editForm.subject } : e
    ));
    setEditingId(null);

    await updateEmail(id, editForm);
  };

  const filteredEmails = emails.filter(email => 
    email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    email.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Takip Edilen E-Postalar</h1>
          <p className="text-gray-500 mt-1">Gönderdiğiniz e-postaların durumunu ve detaylarını yönetin.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
            />
          </div>
          <button 
            onClick={() => loadEmails(true)}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            title="Listeyi Yenile"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-gray-400">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
             <p>Yükleniyor...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Alıcı</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Konu</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gönderim Tarihi</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Okunma Tarihi</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      Henüz kayıt bulunamadı veya arama sonucu boş.
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        {email.status === 'opened' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-fade-in">
                            <MailOpen size={12} className="mr-1" /> Okundu
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <Mail size={12} className="mr-1" /> Gönderildi
                          </span>
                        )}
                      </td>
                      
                      {/* Editable Columns */}
                      {editingId === email.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={editForm.recipient}
                              onChange={(e) => setEditForm({...editForm, recipient: e.target.value})}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={editForm.subject}
                              onChange={(e) => setEditForm({...editForm, subject: e.target.value})}
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            {email.recipient === 'Belirtilmedi' ? <span className="text-gray-400 italic">Belirtilmedi</span> : email.recipient}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={email.subject}>
                            {email.subject}
                          </td>
                        </>
                      )}

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(email.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {email.openedAt ? new Date(email.openedAt).toLocaleString('tr-TR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                        {editingId === email.id ? (
                          <>
                            <button 
                              onClick={() => saveEditing(email.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Kaydet"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={cancelEditing}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="İptal"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startEditing(email)}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 size={18} />
                            </button>
                            {email.status !== 'opened' && (
                              <button 
                                onClick={() => handleSimulateOpen(email.id)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Simülasyon: E-postayı 'Okundu' olarak işaretle"
                              >
                                <ExternalLink size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(email.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
         <div className="p-1 bg-blue-100 rounded">
            <ExternalLink className="text-blue-700" size={16} />
         </div>
         <div className="text-sm text-blue-800">
           <p className="font-semibold">Simülasyon Hakkında:</p>
           <p>
             Eğer "Simüle Et" butonuna basınca liste güncelleniyor ancak sayfayı yenileyince eski haline dönüyorsa, veritabanı yazma izninizde sorun olabilir. 
             Gerçek bir e-posta gönderdiğinizde bu panelin tetiklenmesi için özel bir sunucu yazılımı (Backend) kurulması gereklidir; 
             mevcut uygulama bir arayüz demosudur.
           </p>
         </div>
      </div>
    </div>
  );
};