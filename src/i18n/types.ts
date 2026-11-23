import { en } from './messages-en';

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
