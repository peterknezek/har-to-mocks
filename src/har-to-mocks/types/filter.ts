export enum Method {
  GET = 'GET',
  // HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  // CONNECT = 'CONNECT',
  // OPTIONS = 'OPTIONS',
  // TRACE = 'TRACE',
  PATCH = 'PATCH',
}

export enum ResourceType {
  xhr = 'xhr',
  fetch = 'fetch',
  // js = 'script',
  // css = 'stylesheet',
  // svg = 'text/plain',
  // png = 'png',
  // gif = 'gif',
  // font = 'font',
  doc = 'document',
  // ws = 'websocket',
}
export interface Filter {
  methods?: Method[];
  resourceType?: ResourceType;
  url?: string;
}
