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
  type: 'function' | 'call';
  children: RuntimeProcessNode[];
  parentId?: string;
  status: 'running' | 'completed';
  startTime: number;
  endTime?: number;
} 