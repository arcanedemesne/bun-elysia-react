export interface IMessageInsert {
  message: string;
  channel: string;
  organizationId?: string;
  teamId?: string;
  recipientId?: string;
}
