export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number; // 1-5
  RequestedTaskIDs: string[];
  GroupTag: string;
  AttributesJSON: Record<string, any>;
}
