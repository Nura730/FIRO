import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import { connectTestDb, clearTestDb, closeTestDb } from "./setup";
import { User } from "../modules/auth/auth.model";

describe("Auth Integration Tests", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(mockUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(mockUser.name);
      expect(res.body.data.email).toBe(mockUser.email);
      expect(res.body.data.id).toBeDefined();

      const userInDb = await User.findOne({ email: mockUser.email });
      expect(userInDb).not.toBeNull();
      expect(userInDb!.name).toBe(mockUser.name);
    });

    it("should throw error if email is already registered", async () => {
      // First registration
      await request(app).post("/api/auth/register").send(mockUser);

      // Duplicate registration
      const res = await request(app)
        .post("/api/auth/register")
        .send(mockUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already registered");
    });

    it("should validate input schema", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "J",
          email: "invalid-email",
          password: "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Pre-register user
      await request(app).post("/api/auth/register").send(mockUser);
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: mockUser.email,
          password: mockUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.name).toBe(mockUser.name);
    });

    it("should return 401 for incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: mockUser.email,
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid email or password");
    });

    it("should return 401 for non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "none@example.com",
          password: "password123",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
