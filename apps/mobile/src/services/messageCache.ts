import { ConversationSummary, Message } from './conversationService';

class MessageCacheStore {
  private conversationsCache: Map<string, ConversationSummary[]> = new Map(); // keyed by role ('guest'|'host')
  
  private messagesCache: Map<string, Message[]> = new Map(); // keyed by conversationId

  private lastFetchTime: Map<string, number> = new Map();

  getConversations(role: string): ConversationSummary[] | null {
    return this.conversationsCache.get(role) ?? null;
  }

  setConversations(role: string, data: ConversationSummary[]): void {
    this.conversationsCache.set(role, data);
    this.lastFetchTime.set(`conv_${role}`, Date.now());
  }

  getMessages(conversationId: string): Message[] | null {
    return this.messagesCache.get(conversationId) ?? null;
  }

  setMessages(conversationId: string, data: Message[]): void {
    this.messagesCache.set(conversationId, data);
    this.lastFetchTime.set(`msg_${conversationId}`, Date.now());
  }

  isStale(key: string, maxAgeMs: number = 5000): boolean {
    const last = this.lastFetchTime.get(key);
    if (!last) return true;
    return Date.now() - last > maxAgeMs;
  }

  clearAll(): void {
    this.conversationsCache.clear();
    this.messagesCache.clear();
    this.lastFetchTime.clear();
  }
}

export const messageCache = new MessageCacheStore();
