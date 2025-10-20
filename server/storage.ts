import { type User, type InsertUser, type EmailCapture, type InsertEmailCapture } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createEmailCapture(emailCapture: InsertEmailCapture): Promise<EmailCapture>;
  getAllEmailCaptures(): Promise<EmailCapture[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private emailCaptures: Map<string, EmailCapture>;

  constructor() {
    this.users = new Map();
    this.emailCaptures = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createEmailCapture(insertEmailCapture: InsertEmailCapture): Promise<EmailCapture> {
    const id = randomUUID();
    const emailCapture: EmailCapture = {
      ...insertEmailCapture,
      id,
      createdAt: new Date(),
    };
    this.emailCaptures.set(id, emailCapture);
    return emailCapture;
  }

  async getAllEmailCaptures(): Promise<EmailCapture[]> {
    return Array.from(this.emailCaptures.values());
  }
}

export const storage = new MemStorage();
