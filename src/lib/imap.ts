import { ImapFlow, MailboxLockObject, ListResponse } from "imapflow";
import { MessageListResult, CustomMessageObject } from "@/types/Project";
import { ServerInfo } from "@/types/server";
import { simpleParser } from "mailparser";
import z from "zod";

/**
 * +------------------------------------------------+
 * |                IMAPWorker                      |
 * +------------------------------------------------+
 * | - clients: Map<string, IMAPWorker>             |
 * | - connectionKey: string                        |
 * | - client: ImapFlow | null                       |
 * | - connectionInfo: ServerInfo | null             |
 * | - mailboxLock: MailboxLockObject | null         |
 * | - isConnecting: boolean                         |
 * | - isConnected: boolean                          |
 * | - isVerified: boolean                           |
 * | - isLoggedOut: boolean                          |
 * +------------------------------------------------+
 * | + constructor(connection: ServerInfo)          |
 * | + static async getClient(data: ServerInfo):      |
 * |       Promise<IMAPWorker>                        |
 * | + connect(): Promise<void>                       |
 * | + disconnect(): Promise<void>                    |
 * | + listMailboxes(): Promise<ListResponse[]>       |
 * | + listMessages(...): Promise<MessageListResult>  |
 * | + getMessage(...): Promise<CustomMessageObject>    |
 * | - getIsVerified(): Promise<boolean>              |
 * | - logOut(): Promise<void>                        |
 * | - setupEventListeners(): void                    |
 * | - handleConnectionIssue(): Promise<void>         |
 * | - reconnect(): Promise<void>                     |
 * +------------------------------------------------+
 */
export class IMAPWorker {
  /** All class instances keyed by a unique connection string */
  private static clients: Map<string, IMAPWorker> = new Map();

  /** Unique key for the current connection (computed once in the constructor) */
  private connectionKey: string;

  /** IMAP client instance. */
  private imapClient: ImapFlow | null = null;

  /** Connection configuration for the current instance. */
  private connectionInfo: ServerInfo | null = null;

  /** Holds the mailbox lock if one is active. */
  private mailboxLock: MailboxLockObject | null = null;

  /** Indicates if a connection attempt is in progress. */
  private isConnecting: boolean = false;

  /** Indicates if the client is currently connected. */
  private isConnected: boolean = false;

  /** Indicates if the connection is verified. */
  private isVerified: boolean = false;

  /** Indicates if the user is logged out. */
  private isLoggedOut: boolean = true;

  /** Zod schema for validating ServerInfo */
  private static serverInfoSchema = z.object({
    host: z.string(),
    port: z.number(),
    secure: z.boolean(),
    verifyOnly: z.boolean().optional(),
    auth: z.object({
      user: z.string(),
      pass: z.string().optional(),
      accessToken: z.string().optional(),
    }),
  });

  /**
   * Public constructor that initializes the IMAPWorker instance.
   * Before creating a new instance, it checks if an instance with the same connection key
   * already exists. If so, it returns that instance.
   *
   * @param connection - IMAP server connection configuration.
   * @throws Error if configuration is missing or invalid.
   */
  public constructor(connection: ServerInfo) {
    if (!connection) {
      throw new Error("Connection configuration is required");
    }

    // Validate connection configuration.
    const validation = IMAPWorker.serverInfoSchema.safeParse(connection);
    if (!validation.success) {
      throw new Error(
        `Invalid connection configuration: ${validation.error.message}`
      );
    }

    // Compute the unique connection key and store it in a private property.
    // This key is based on host, port, and user, so that identical configurations map to the same key.
    this.connectionKey = `${connection.host}:${connection.port}:${connection.auth.user}`;

    // Check if an instance already exists for this connection key.
    const existingInstance = IMAPWorker.clients.get(this.connectionKey);
    if (existingInstance) {
      return existingInstance;
    }

    console.log("Creating IMAP worker");

    // No existing instance found; initialize properties.
    this.connectionInfo = connection;
    this.imapClient = new ImapFlow(connection);

    // Register this new instance using the computed key.
    IMAPWorker.clients.set(this.connectionKey, this);
  }

  /**
   * Retrieves an existing IMAP worker instance or creates a new instance if none exists.
   * Ensures that the client is connected before returning.
   * @param data - The server information required for connection.
   * @returns A promise that resolves to the instance of IMAPWorker.
   * @throws Error if the connection configuration is missing.
   */
  public static async getClient(data: ServerInfo): Promise<IMAPWorker> {
    console.log("Getting IMAP worker instance");

    if (!data) throw new Error("Connection configuration is required");

    // Compute the key using the same logic as in the constructor.
    const key = `${data.host}:${data.port}:${data.auth.user}`;
    let worker = IMAPWorker.clients.get(key);

    // Create a new instance if one doesn't already exist.
    if (!worker) {
      worker = new IMAPWorker(data);
    }

    // Connect if the client is not yet authenticated.
    if (!worker.imapClient || !worker.imapClient.authenticated) {
      await worker.connect();
    }

    return worker;
  }

  /**
   * Verifies that the IMAP connection can be established.
   * If already verified, it returns true immediately.
   * @returns True if the connection is verified; otherwise, false.
   */
  private async getIsVerified(): Promise<boolean> {
    console.log("Verifying IMAP connection");

    if (this.isVerified) {
      console.log("Already verified");
      return true;
    }

    if (!this.connectionInfo) return false;

    const client = new ImapFlow({
      host: this.connectionInfo.host,
      port: this.connectionInfo.port,
      secure: this.connectionInfo.secure,
      verifyOnly: true,
      auth: {
        user: this.connectionInfo.auth.user,
        pass: this.connectionInfo.auth.pass,
      },
    });

    return client
      .connect()
      .then(() => client.logout())
      .then(() => {
        this.isVerified = true;
        this.isLoggedOut = true;
        return true;
      })
      .catch(() => false);
  }

  /**
   * Logs out the client if authenticated.
   * Also resets connection flags appropriately.
   */
  private async logOut(): Promise<void> {
    console.log("Logging out of IMAP server");

    if (!this.imapClient) {
      console.warn("No client instance to log out");
      this.isLoggedOut = true;
      this.isConnected = false;
      return;
    }

    if (this.imapClient.authenticated) {
      await this.imapClient.logout().catch(() => {
        this.imapClient?.close();
      });
    }
    this.isLoggedOut = true;
    this.isConnected = false;
  }

  /**
   * Sets up event listeners for handling errors and unexpected client closures.
   */
  private setupEventListeners(): void {
    console.log("Setting up IMAP event listeners");

    if (!this.imapClient) return;

    this.imapClient.on("error", (err) => {
      const error = err instanceof Error ? err : new Error("Unknown error");
      console.error("IMAP error:", error);
      this.handleConnectionIssue().catch((e) =>
        console.error("Error handling connection issue:", e)
      );
    });

    this.imapClient.on("close", () => {
      if (this.isLoggedOut) return;
      this.handleConnectionIssue().catch((e) =>
        console.error("Error handling connection issue:", e)
      );
    });
  }

  /**
   * Handles connection issues by marking the client as disconnected and triggering a reconnect.
   */
  private async handleConnectionIssue(): Promise<void> {
    console.log("Handling IMAP connection issue");
    this.isConnected = false;
    await this.reconnect();
  }

  /**
   * Establishes a connection to the IMAP server.
   * Performs double-checks on the client state to avoid redundant connections.
   * @throws Error if the connection attempt fails.
   */
  public async connect(): Promise<void> {
    console.log("Connecting to IMAP server");

    if (this.isConnecting) {
      console.log("Connection already in progress");
      return;
    }

    // Verify connection if not already verified.
    if (!this.isVerified) {
      const verified = await this.getIsVerified();
      if (!verified) {
        console.error("Verification failed. Cannot connect.");
        return Promise.reject(new Error("Verification failed."));
      }
    }

    this.setupEventListeners();

    if (
      this.imapClient &&
      this.imapClient.authenticated &&
      this.isConnected &&
      !this.isLoggedOut
    ) {
      console.log("Already connected and authenticated");
      return;
    }

    this.isConnecting = true;

    if (!this.imapClient) {
      if (!this.connectionInfo) {
        this.isConnecting = false;
        return Promise.reject(new Error("Connection information is missing"));
      }
      this.imapClient = new ImapFlow(this.connectionInfo);
      // Use the stored connectionKey instead of recalculating it.
      IMAPWorker.clients.set(this.connectionKey, this);
    }

    return this.imapClient
      .connect()
      .then(() => {
        console.log("Connected to IMAP server");
        this.isConnected = true;
        this.isLoggedOut = false;
      })
      .catch((error) => {
        console.error("Error connecting to IMAP server:", error);
        throw error;
      })
      .finally(() => {
        this.isConnecting = false;
      });
  }

  /**
   * Disconnects from the IMAP server and cleans up resources.
   */
  public async disconnect(): Promise<void> {
    console.log("Disconnecting from IMAP server");

    if (this.mailboxLock) {
      await Promise.resolve(this.mailboxLock.release())
        .catch((error) =>
          console.error("Failed to release mailbox lock:", error)
        )
        .finally(() => {
          this.mailboxLock = null;
        });
    }

    if (this.imapClient && this.imapClient.authenticated && !this.isLoggedOut) {
      await this.logOut().catch((error) => {
        console.error("Error during logout:", error);
        this.imapClient?.close();
      });
    }

    this.imapClient = null;
    this.isConnected = false;
    this.isLoggedOut = true;
  }

  /**
   * Attempts to reconnect to the IMAP server.
   */
  private async reconnect(): Promise<void> {
    console.log("Reconnecting to IMAP server");
    if (this.isConnecting) return;

    await this.connect().catch(() => {
      console.error("Reconnection failed.");
    });
  }

  /**
   * Retrieves a list of available mailboxes.
   * @returns An array of mailbox information.
   * @throws Error if the imapClient is not ready.
   */
  public async listMailboxes(): Promise<ListResponse[]> {
    console.log("Listing mailboxes");

    if (!this.imapClient || !this.isConnected || this.isLoggedOut) {
      return Promise.reject(new Error("IMAP imapClient is not ready"));
    }

    return this.imapClient.list();
  }

  /**
   * Retrieves a paginated list of messages from the specified mailbox.
   * @param path - Mailbox path.
   * @param page - Page number (starting from 1).
   * @param pageSize - Number of messages per page.
   * @returns An object containing the messages and pagination details.
   */
  public async listMessages(
    path: string = "[Gmail]/All Mail",
    page: number = 1,
    pageSize: number = 10
  ): Promise<MessageListResult> {
    if (!this.imapClient || !this.isConnected || this.isLoggedOut) {
      return Promise.reject(new Error("IMAP imapClient is not ready"));
    }

    // Use a local mailbox lock to ensure proper release even in error cases.
    return this.imapClient.getMailboxLock(path).then((lock) => {
      return this.imapClient!.status(path, { messages: true })
        .then((status) => {
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

          return this.imapClient!.fetchAll(range, fetchOptions).then(
            (messages) => ({
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
            })
          );
        })
        .finally(() => {
          lock.release();
        });
    });
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
    if (!this.imapClient || !this.isConnected || this.isLoggedOut) {
      return Promise.reject(new Error("IMAP imapClient is not ready"));
    }

    return this.imapClient.getMailboxLock(path).then((lock) => {
      return this.imapClient!.fetchOne(
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
      )
        .then((message) => {
          if (!message) throw new Error("Message not found");
          return simpleParser(message.source).then((parsed) => ({
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
          }));
        })
        .finally(() => {
          lock.release();
        });
    });
  }
}
