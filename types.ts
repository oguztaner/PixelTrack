export interface TrackedEmail {
  id: string;
  recipient: string;
  subject: string;
  createdAt: string; // ISO String
  openedAt: string | null; // ISO String or null
  status: 'sent' | 'opened';
  trackingId: string;
}

export interface Stats {
  totalSent: number;
  totalOpened: number;
  openRate: number;
}
