export interface RuntimeProcessEvent {
  id: string;
  name: string;
  type: 'function' | 'call';
  status: 'start' | 'end';
  parentId?: string;
  timestamp: number;
}

export interface RuntimeProcessNode {
  id: string;
  name: string;
  type: 'function' | 'call' | 'promise-chain';
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime: number;
  endTime?: number;
  children: RuntimeProcessNode[];
  parentId?: string;
} 