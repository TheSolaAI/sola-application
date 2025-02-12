export interface ChatRoom {
  id?: number;
  name: string;
  agentId: number;
}

export interface ChatRoomPatch {
  id?: number;
  name?: string;
  agentId?: number;
}
