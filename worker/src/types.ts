export interface Env {
  WORKER_ENV?: string;
  MONGODB_URI?: string;
  MONGODB_DATABASE?: string;
  ADMIN_API_KEY?: string;
  DEVATLAS_KV?: KVNamespace;
}

export interface Variables {
  requestId: string;
}
