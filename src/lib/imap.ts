import { ImapFlow, MailboxLockObject, ListResponse } from "imapflow";
import { MessageListResult, CustomMessageObject, ServerInfo } from "@/types";
import { simpleParser } from "mailparser";

/**
 * Class for managing connections and operations with an IMAP email server.
 */
export class IMAPWorker {
  /** Singleton instance of IMAPWorker. */
  private static clients: { [key: ImapFlow["id"]]: ImapFlow } = {};

  /** Connection configuration for the current instance. */
  private connectionConfig: ServerInfo | null = null;

  /** IMAP client instance. */
  private client: ImapFlow | null = null;

  /** Retrieves the IMAP server connection information. */
  private mailboxLock: MailboxLockObject | null = null;

  /** Indicates if a connection attempt is in progress. */
  private isConnecting: boolean = false;

  /** Indicates if the client is currently connected. */
  private isConnected: boolean = false;

  /** Indicates if the connection is verified. */
  private isVerified: boolean = false;

  /**
   * Initializes an IMAPWorker instance with the provided connection settings.
   * @param connection - IMAP server connection configuration.
   * @throws Error if no connection configuration is provided.
   */
  private constructor(connection: ServerInfo) {
    if (!connection) throw new Error("Connection configuration is required");
    console.log("Creating IMAP worker");
    this.connectionConfig = connection;
    this.client = new ImapFlow(connection);
    IMAPWorker.clients[this.client.id] = this.client;
  }

  /**
   * Retrieves an existing IMAPFlow client by its ID.
   * @param id - The client's unique identifier.
   * @returns The corresponding IMAPFlow client.
   * @throws Error if the client ID is missing or the client is not found.
   */
  public static async getClient(id: ImapFlow["id"]): Promise<ImapFlow> {
    if (!id) throw new Error("Client ID is required");
    console.log("Getting IMAP worker client");

    if (!IMAPWorker.clients[id]) throw new Error("Client not found");

    return IMAPWorker.clients[id];
  }

  /**
   * Verifies the ability to establish a connection with the IMAP server.
   * @returns True if the connection is verified; otherwise, false.
   */
  private async getIsVerified(): Promise<boolean> {
    console.log("Verifying IMAP connection");

    if (!this.client || !this.connectionConfig) return false;

    const client = new ImapFlow({
      host: this.connectionConfig?.host,
      port: this.connectionConfig?.port,
      secure: this.connectionConfig?.secure,
      verifyOnly: true,
      auth: {
        user: this.connectionConfig?.auth?.user,
        pass: this.connectionConfig?.auth?.pass,
      },
    });

    const isVerified = await client
      .connect()
      .then(() => {
        client.logout();
        return true;
      })
      .catch((error) => {
        console.error("Error verifying connection:", error);
        return false;
      });

    if (isVerified) {
      this.isVerified = true;
      console.log("IMAP connection verified");
    } else {
      console.error("IMAP connection verification failed");
    }

    return isVerified;
  }

  /**
   * Registers event listeners to handle client errors and unexpected closures.
   */
  private setupEventListeners(): void {
    console.log("Setting up IMAP event listeners");

    this.client?.on("connection", () => {
      console.log("someone connected!");
    });

    this.client?.on("error", (error) => {
      this.handleConnectionIssue(error instanceof Error ? error : undefined);
    });

    this.client?.on("close", () => {
      this.handleConnectionIssue();
    });
  }

  /**
   * Handles IMAP connection issues and initiates a reconnection.
   * @param error - Optional error that triggered the issue.
   */
  private async handleConnectionIssue(error?: Error): Promise<void> {
    console.log("Handling IMAP connection issue");

    this.isConnected = false;

    if (error) {
      console.error(`IMAP error: ${error.message}`);
    } else {
      console.error("IMAP connection closed");
    }

    await this.reconnect();
  }

  /**
   * Initializes the IMAP client by verifying the connection and setting up event listeners.
   */
  private async initializeClient(): Promise<void> {
    console.log("Initializing IMAP client");

    if (!this.isVerified) {
      const isVerified = await this.getIsVerified();

      if (!isVerified) {
        console.error("IMAP connection verification failed");
        return;
      }
    }

    this.setupEventListeners();

    await this.connect().catch((error) =>
      this.handleConnectionIssue(error instanceof Error ? error : undefined)
    );
  }

  /**
   * Establishes a connection to the IMAP server.
   * @throws Error if the connection attempt fails.
   */
  public async connect(): Promise<void> {
    console.log("Connecting to IMAP server");

    if (this.isConnecting) {
      console.log("Connection already in progress");
      return;
    }

    this.isConnecting = true;

    if (this.client?.authenticated) {
      console.log("Already connected");
      return;
    }

    try {
      await this.client?.connect();
      console.log("Connected to IMAP server");
      this.isConnected = true;
    } catch (error) {
      console.error("Error connecting to IMAP server:", error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnects from the IMAP server and releases any held resources.
   */
  public async disconnect(): Promise<void> {
    console.log("Disconnecting from IMAP server");

    if (this.mailboxLock) {
      try {
        this.mailboxLock.release();
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
    this.isConnected = false;
  }

  /**
   * Attempts to reconnect to the IMAP server by disconnecting and then reinitializing.
   */
  private async reconnect(): Promise<void> {
    console.log("Reconnecting to IMAP server");

    if (this.isConnecting) return;

    try {
      await this.initializeClient();
    } catch (error) {
      console.error("Reconnection failed:", error);
    }
  }

  /**
   * Retrieves a list of available mailboxes.
   * @returns An array of mailbox information.
   */
  public async listMailboxes(): Promise<ListResponse[]> {
    console.log("Listing mailboxes");

    try {
      const list = await this.client?.list();
      const allMailbox = list?.find(
        (box) => box.path === "[Gmail]/All Mail" || box.path === "All Mail"
      );
      return allMailbox ? [allMailbox] : [];
    } catch (error) {
      console.error("Failed to list mailboxes:", error);
      throw error;
    }
  }

  /**
   * Retrieves a paginated list of messages from the specified mailbox.
   * @param path - Mailbox path.
   * @param page - Page number (starting from 1).
   * @param pageSize - Number of messages per page.
   * @returns An object containing the messages and pagination details.
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

  /**
   * Fetches detailed information and content for a specific message by UID.
   * @param path - Mailbox path.
   * @param uid - Unique identifier of the message.
   * @returns An object with the message details, raw source, and parsed content.
   * @throws Error if the message is not found.
   */
  public async getMessage(
    path: string,
    uid: number
  ): Promise<CustomMessageObject> {
    try {
      this.mailboxLock = (await this.client?.getMailboxLock(path)) ?? null;

      const message = await this.client?.fetchOne(
        String(uid),
        {
          uid: true,
          envelope: true,
          flags: true,
          bodyStructure: true,
          size: true,
          source: true,
        },
        { uid: true }
      );

      if (!message) {
        throw new Error("Message not found");
      }

      // Parse the email content
      const parsed = await simpleParser(message.source);

      return {
        path,
        uid: message.uid,
        envelope: message.envelope,
        flags: message.flags,
        bodyStructure: message.bodyStructure,
        size: message.size,
        source: message.source,
        parsed: {
          html: parsed.html || null,
          text: parsed.text || null,
          attachments: parsed.attachments || [],
        },
      };
    } catch (error) {
      console.error("Error fetching message:", error);
      throw error;
    } finally {
      if (this.mailboxLock) {
        await this.mailboxLock.release();
        this.mailboxLock = null;
      }
    }
  }
}
