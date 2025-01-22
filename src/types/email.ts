import { MessageEnvelopeObject, MessageStructureObject } from "imapflow";

export interface CustomMessageObject {
  path: string;
  uid: number;
  envelope: MessageEnvelopeObject;
  flags: Set<string>;
  bodyStructure: MessageStructureObject;
  size: number;
}

export interface MessageListResult {
  messages: CustomMessageObject[];
  page: number;
  totalPages: number;
  totalMessages: number;
}
