/**
 * Shared types for the conversations module.
 * Exported so they can be referenced by both the service and controller
 * without triggering "cannot be named" TypeScript errors.
 *
 * NOTE: Supabase join queries always return related rows as arrays, even for
 * to-one foreign-key relationships. The array types here (e.g. `Array<{name}>`)
 * reflect the actual SDK return shape.
 */

export interface ConversationRow {
  id: string;
  booking_id: string;
  guest_id: string;
  host_id: string;
  property_id: string;
  created_at: string;
  last_message?: string;
  last_message_at?: string;
  guest?: { id: string; name: string } | null;
  host?: { id: string; name: string } | null;
  property?: { id: string; name: string; photos?: string[] } | null;
  unreadCount?: number;
  messageCount?: number;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: 'guest' | 'host' | 'admin';
  content: string;
  read_by_guest: boolean;
  read_by_host: boolean;
  created_at: string;
  sender?: { id: string; name: string } | null;
}

