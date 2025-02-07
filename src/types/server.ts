export interface ServerInfo {
  host: string;
  port: number;
  secure: boolean;
  verifyOnly?: boolean;
  auth: {
    user: string;
    pass?: string;
    accessToken?: string;
  };
}
