import { MessageEnvelopeObject, MessageStructureObject } from "imapflow";
import { Attachment } from "mailparser";

export interface CustomMessageObject {
  path: string;
  uid: number;
  envelope: MessageEnvelopeObject;
  flags: Set<string>;
  bodyStructure: MessageStructureObject;
  size: number;
  source?: Buffer;
  parsed?: {
    html: string | null;
    text: string | null;
    attachments: Attachment[];
  };
}

export interface MessageListResult {
  messages: CustomMessageObject[];
  page: number;
  totalPages: number;
  totalMessages: number;
}
