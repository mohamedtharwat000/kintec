export interface ServerInfo {
  host: string;
  port: number;
  auth: {
    user: string;
    pass?: string;
    accessToken?: string;
  };
}
