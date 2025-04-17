// MessageQueue.ts
import { ChatContentType, ChatItem } from '@/types/chatItem';

// Interface for serialized queue data
export type SerializedQueue<T> = {
  head: number;
  tail: number;
  storage: Record<number, T>;
};

/**
 * A specialized queue for chat messages that optimizes enqueue/dequeue operations
 * while remaining serializable for Zustand state management
 */
export class MessageQueue<T extends ChatItem<ChatContentType>> {
  // Using a linked list structure but keeping it serializable
  private head = 0;
  private tail = 0;
  private storage: Record<number, T> = {};

  /**
   * Add a message to the end of the queue
   * O(1) operation
   */
  enqueue(item: T): void {
    this.storage[this.tail] = item;
    this.tail++;
  }

  /**
   * Remove and return the first message from the queue
   * O(1) operation
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    const item = this.storage[this.head];
    delete this.storage[this.head];
    this.head++;

    // Reset indices when queue becomes empty to prevent integer overflow
    if (this.head === this.tail) {
      this.head = 0;
      this.tail = 0;
    }

    return item;
  }

  /**
   * View the first message without removing it
   */
  peek(): T | undefined {
    return this.isEmpty() ? undefined : this.storage[this.head];
  }

  /**
   * Check if the queue is empty
   */
  isEmpty(): boolean {
    return this.head === this.tail;
  }

  /**
   * Get the number of messages in the queue
   */
  size(): number {
    return this.tail - this.head;
  }

  /**
   * Clear all messages from the queue
   */
  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.storage = {};
  }

  /**
   * Convert the queue to an array (useful for processing all messages)
   * Returns messages in order from oldest to newest
   */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = this.head; i < this.tail; i++) {
      if (this.storage[i]) {
        result.push(this.storage[i]);
      }
    }
    return result;
  }

  /**
   * Create a serializable representation for storing in Zustand
   */
  serialize(): SerializedQueue<T> {
    return {
      head: this.head,
      tail: this.tail,
      storage: { ...this.storage },
    };
  }

  /**
   * Create a new queue from serialized data
   * Handles null/undefined input safely by returning an empty queue
   */
  static fromSerialized<T extends ChatItem<ChatContentType>>(
    data?: SerializedQueue<T> | null
  ): MessageQueue<T> {
    const queue = new MessageQueue<T>();

    // If data is undefined or null, return an empty queue
    if (!data) {
      return queue;
    }

    // Safely copy properties with fallbacks
    queue.head = data.head ?? 0;
    queue.tail = data.tail ?? 0;
    queue.storage = { ...(data.storage || {}) };

    return queue;
  }

  /**
   * Create an empty serialized queue
   */
  static createEmpty<
    T extends ChatItem<ChatContentType>,
  >(): SerializedQueue<T> {
    return {
      head: 0,
      tail: 0,
      storage: {},
    };
  }
}
