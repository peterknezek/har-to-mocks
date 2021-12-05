import type { Method, ResourceType } from './filter';

export interface Har {
  log: Log;
}

interface Log {
  version: string;
  creator: Creator;
  pages: unknown[];
  entries: Entry[];
}

export interface Entry {
  _initiator: Initiator;
  _priority: string;
  _resourceType: ResourceType;
  cache: unknown;
  connection?: string;
  request: Request;
  response: Response;
  serverIPAddress: string;
  startedDateTime: string;
  time: number;
  timings: Timings;
}

interface Timings {
  blocked: number;
  dns: number;
  ssl: number;
  connect: number;
  send: number;
  wait: number;
  receive: number;
  _blocked_queueing: number;
}

interface Response {
  status: number;
  statusText: string;
  httpVersion: string;
  headers: Header[];
  cookies: Cooky2[];
  content: Content;
  redirectURL: string;
  headersSize: number;
  bodySize: number;
  _transferSize: number;
  _error?: unknown;
}

interface Content {
  size: number;
  mimeType: string;
  text: string;
  encoding?: string;
}

interface Cooky2 {
  name: string;
  value: string;
  path: string;
  domain: string;
  expires: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
}

interface Request {
  method: Method;
  url: string;
  httpVersion: string;
  headers: Header[];
  queryString: Header[];
  cookies: Cooky[];
  headersSize: number;
  bodySize: number;
  postData?: PostData;
}

interface PostData {
  mimeType: string;
  text: string;
  params: Header[];
}

interface Cooky {
  name: string;
  value: string;
  path: string;
  domain: string;
  expires: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
}

interface Header {
  name: string;
  value: string;
}

interface Initiator {
  type: string;
  stack?: Stack;
  url?: string;
  lineNumber?: number;
}

interface Stack {
  callFrames: CallFrame[];
  parentId?: ParentId;
  parent?: Parent2;
}

interface Parent2 {
  description: string;
  callFrames: CallFrame[];
  parent?: Parent;
}

interface Parent {
  description: string;
  callFrames: CallFrame[];
}

interface ParentId {
  id: string;
  debuggerId: string;
}

interface CallFrame {
  functionName: string;
  scriptId: string;
  url: string;
  lineNumber: number;
  columnNumber: number;
}

interface Creator {
  name: string;
  version: string;
}
