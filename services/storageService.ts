import { supabase } from './supabaseClient';
import { TrackedEmail, Stats } from '../types';

// Map database snake_case to app camelCase
const mapToTrackedEmail = (data: any): TrackedEmail => ({
  id: data.id,
  recipient: data.recipient,
  subject: data.subject,
  createdAt: data.created_at,
  openedAt: data.opened_at,
  status: data.status,
  trackingId: data.tracking_id
});

export const getEmails = async (): Promise<TrackedEmail[]> => {
  const { data, error } = await supabase
    .from('tracked_emails')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching emails:', JSON.stringify(error));
    return [];
  }

  return (data || []).map(mapToTrackedEmail);
};

export const saveEmail = async (email: TrackedEmail): Promise<{ success: boolean; error?: string }> => {
  // We exclude 'id' to let the database generate it
  const { error } = await supabase
    .from('tracked_emails')
    .insert([{
      tracking_id: email.trackingId,
      recipient: email.recipient,
      subject: email.subject,
      status: email.status,
      created_at: email.createdAt,
      opened_at: email.openedAt
    }]);

  if (error) {
    console.error('Error saving email:', JSON.stringify(error));
    return { success: false, error: error.message || 'Unknown database error' };
  }
  return { success: true };
};

export const updateEmail = async (id: string, updates: Partial<TrackedEmail>): Promise<void> => {
  const dbUpdates: any = {};
  if (updates.recipient) dbUpdates.recipient = updates.recipient;
  if (updates.subject) dbUpdates.subject = updates.subject;
  
  const { error } = await supabase
    .from('tracked_emails')
    .update(dbUpdates)
    .eq('id', id);

  if (error) console.error('Error updating email:', JSON.stringify(error));
};

export const markAsOpened = async (id: string): Promise<string | null> => {
  const { error } = await supabase
    .from('tracked_emails')
    .update({ 
      status: 'opened', 
      opened_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) {
    console.error('Error marking as opened:', JSON.stringify(error));
    return error.message;
  }
  return null;
};

export const deleteEmail = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tracked_emails')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting email:', JSON.stringify(error));
};

export const getStats = async (): Promise<Stats> => {
  const { data, error } = await supabase
    .from('tracked_emails')
    .select('status');

  if (error) {
    console.error('Error fetching stats:', JSON.stringify(error));
    return { totalSent: 0, totalOpened: 0, openRate: 0 };
  }

  const safeData = data || [];
  const totalSent = safeData.length;
  const totalOpened = safeData.filter((e: any) => e.status === 'opened').length;
  
  return {
    totalSent,
    totalOpened,
    openRate: totalSent === 0 ? 0 : Math.round((totalOpened / totalSent) * 100),
  };
};

// Real-time subscription helper
export const subscribeToChanges = (callback: () => void) => {
  console.log("Initializing Realtime subscription...");
  const channel = supabase
    .channel('public:tracked_emails')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tracked_emails' },
      (payload) => {
        console.log('Real-time update received:', payload);
        callback();
      }
    )
    .subscribe((status) => {
      console.log('Realtime Status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to database changes');
      }
      if (status === 'CHANNEL_ERROR') {
        console.error('Realtime channel error. Check connection or policies.');
      }
    });

  return () => {
    console.log("Unsubscribing from Realtime...");
    supabase.removeChannel(channel);
  };
};

export const generateTrackingId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};