import { ImapFlow, MailboxLockObject, ListResponse } from "imapflow";
import { ServerInfo } from "@/types/server";
import { MessageListResult, CustomMessageObject } from "@/types/email";

/**
 * Handles IMAP email server connections and operations.
 * @class IMAPWorker
 * @description Manages connection, authentication, and communication with IMAP servers.
 */
export class IMAPWorker {
  private static instance: IMAPWorker | null = null;
  private client: ImapFlow | null = null;
  private mailboxLock: MailboxLockObject | null = null;
  private isConnecting: boolean = false;
  private isDisconnecting: boolean = false;

  /**
   * Creates an instance of IMAPWorker.
   * @param {ServerInfo} connection - IMAP server connection configuration.
   */
  private constructor(private connection: ServerInfo) {
    console.log("Creating IMAP worker");
  }

  /**
   * Retrieves or creates the singleton instance of IMAPWorker.
   * @param {ServerInfo} connection - IMAP server connection configuration.
   * @returns {Promise<IMAPWorker>} The singleton instance of IMAPWorker.
   */
  public static async getInstance(connection: ServerInfo): Promise<IMAPWorker> {
    console.log("Getting IMAP worker instance");

    if (!IMAPWorker.instance) {
      IMAPWorker.instance = new IMAPWorker(connection);
      await IMAPWorker.instance.initializeClient();
    }

    return IMAPWorker.instance;
  }

  /**
   * Initializes the IMAP client with the provided connection settings.
   * @private
   */
  private async initializeClient(): Promise<void> {
    console.log("Initializing IMAP client");

    this.client = new ImapFlow({
      host: this.connection.host,
      port: this.connection.port,
      secure: true,
      emitLogs: false,
      logger: false,
      auth: {
        user: this.connection.auth.user,
        ...(this.connection.auth.pass
          ? { pass: this.connection.auth.pass }
          : { accessToken: this.connection.auth.accessToken }),
      },
    });

    this.setupEventListeners();

    try {
      await this.connect();
    } catch (error) {
      await this.handleConnectionIssue(
        error instanceof Error ? error : undefined
      );
      console.error("Failed to connect during initialization:", error);
    }
  }

  /**
   * Sets up event listeners for the IMAP client.
   * @private
   */
  private setupEventListeners(): void {
    console.log("Setting up IMAP event listeners");

    this.client?.on("error", this.handleConnectionIssue.bind(this));
    this.client?.on("close", this.handleConnectionIssue.bind(this));
  }

  /**
   * Handles IMAP connection issues (errors and unexpected closures).
   * @private
   * @param {Error} [error] - The error that occurred (optional).
   */
  private async handleConnectionIssue(error?: Error): Promise<void> {
    console.log("Handling IMAP connection issue");

    if (this.isDisconnecting) return;

    if (error) {
      console.error(`IMAP error: ${error.message}`);
    } else {
      console.error("IMAP connection closed unexpectedly");
    }

    await this.reconnect();
  }

  /**
   * Establishes a connection to the IMAP server.
   * @public
   * @returns {Promise<void>}
   * @throws {Error} If connection fails.
   */
  public async connect(): Promise<void> {
    console.log("Connecting to IMAP server");

    if (this.isConnecting) {
      console.log("Connection already in progress");
      return;
    }

    if (this.client?.authenticated) {
      console.log("Already connected");
      return;
    }

    this.isConnecting = true;

    try {
      await this.client?.connect();
      console.log("Connected to IMAP server");
    } catch (error) {
      console.error("Error connecting to IMAP server:", error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnects from the IMAP server.
   * @public
   */
  public async disconnect(): Promise<void> {
    console.log("Disconnecting from IMAP server");

    this.isDisconnecting = true;
    if (this.mailboxLock) {
      try {
        await this.mailboxLock.release();
      } catch (error) {
        console.error("Failed to release mailbox lock:", error);
      } finally {
        this.mailboxLock = null;
      }
    }

    if (this.client?.authenticated) {
      await this.client.logout().catch((error) => {
        console.error("Error logging out:", error);
        console.log("Forcing client to close");
        this.client?.close();
      });
    }

    this.client = null;
    this.isDisconnecting = false;
  }

  /**
   * Attempts to reconnect to the IMAP server.
   * @private
   */
  private async reconnect(): Promise<void> {
    console.log("Reconnecting to IMAP server");

    if (this.isConnecting) return;

    try {
      await this.disconnect();

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.initializeClient();
    } catch (error) {
      console.error("Reconnection failed:", error);
    }
  }

  /**
   * Retrieves a list of available mailboxes.
   * @public
   * @returns {Promise<ListResponse[]>} Array of mailbox information.
   */
  public async listMailboxes(): Promise<ListResponse[]> {
    console.log("Listing mailboxes");

    try {
      const list = await this.client?.list();
      return list || [];
    } catch (error) {
      console.error("Failed to list mailboxes:", error);
      throw error;
    }
  }

  /**
   * Lists messages from a mailbox with pagination support
   * @param {string} path - Mailbox path
   * @param {number} page - Page number (1-based)
   * @param {number} pageSize - Number of messages per page
   * @returns {Promise<MessageListResult>} Object containing messages and pagination info
   */
  public async listMessages(
    path: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<MessageListResult> {
    try {
      if (!this.client) {
        return { messages: [], page, totalPages: 0, totalMessages: 0 };
      }

      this.mailboxLock = await this.client.getMailboxLock(path);

      const status = await this.client.status(path, { messages: true });
      const totalMessages = status.messages || 0;
      const totalPages = Math.ceil(totalMessages / pageSize);

      const startIndex = (page - 1) * pageSize + 1;
      const endIndex = Math.min(page * pageSize, totalMessages);
      const range = `${startIndex}:${endIndex}`;

      const fetchOptions = {
        uid: true,
        envelope: true,
        flags: true,
        bodyStructure: true,
        size: true,
      };

      const messages = await this.client.fetchAll(range, fetchOptions);

      return {
        messages: messages.map(
          (message): CustomMessageObject => ({
            path,
            uid: message.uid,
            envelope: message.envelope,
            flags: message.flags,
            bodyStructure: message.bodyStructure,
            size: message.size,
          })
        ),
        page,
        totalPages,
        totalMessages,
      };
    } catch (error) {
      console.error("Error listing messages:", error);
      throw error;
    } finally {
      if (this.mailboxLock) {
        await this.mailboxLock.release();
        this.mailboxLock = null;
      }
    }
  }
}
