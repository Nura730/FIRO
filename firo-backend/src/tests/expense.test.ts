import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import { connectTestDb, clearTestDb, closeTestDb } from "./setup";
import { User } from "../modules/auth/auth.model";
import { Room } from "../modules/room/room.model";
import { Expense } from "../modules/expense/expense.model";

describe("Expense and Settlement Integration Tests", () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;
  let roomId: string;

  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();

    // Register User 1
    const res1 = await request(app)
      .post("/api/auth/register")
      .send({ name: "User One", email: "user1@example.com", password: "password123" });
    
    // Register User 2
    const res2 = await request(app)
      .post("/api/auth/register")
      .send({ name: "User Two", email: "user2@example.com", password: "password123" });

    // Login both
    const login1 = await request(app)
      .post("/api/auth/login")
      .send({ email: "user1@example.com", password: "password123" });
    user1Token = login1.body.data.token;
    user1Id = login1.body.data.user.id;

    const login2 = await request(app)
      .post("/api/auth/login")
      .send({ email: "user2@example.com", password: "password123" });
    user2Token = login2.body.data.token;
    user2Id = login2.body.data.user.id;

    // Create a Room with User 1
    const roomRes = await request(app)
      .post("/api/rooms/create")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ name: "Test Room" });
    roomId = roomRes.body.data._id;

    // User 2 Joins Room
    await request(app)
      .post("/api/rooms/join")
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ inviteCode: roomRes.body.data.inviteCode });
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe("Expense Operations", () => {
    it("should add a new expense with valid splits", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          roomId,
          title: "Electricity Bill",
          amount: 1000,
          category: "UTILITIES",
          splits: [
            { userId: user1Id, amount: 500 },
            { userId: user2Id, amount: 500 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Electricity Bill");
      expect(res.body.data.amount).toBe(1000);
      expect(res.body.data.splits.length).toBe(2);

      const dbExpense = await Expense.findById(res.body.data._id);
      expect(dbExpense).not.toBeNull();
      expect(dbExpense!.splits[0].amount).toBe(500);
    });

    it("should throw validation error if split total does not match total amount", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          roomId,
          title: "Snacks",
          amount: 500,
          category: "FOOD",
          splits: [
            { userId: user1Id, amount: 200 },
            { userId: user2Id, amount: 200 }, // sum 400 != 500
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Split total must equal expense amount");
    });
  });

  describe("Settlement Logic & Dashboard", () => {
    it("should calculate correct balances and settlement suggestions", async () => {
      // User 1 pays 1000, split equally (500 each)
      // User 1 balance should be +500, User 2 balance should be -500
      await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          roomId,
          title: "Electricity",
          amount: 1000,
          category: "UTILITIES",
          splits: [
            { userId: user1Id, amount: 500 },
            { userId: user2Id, amount: 500 },
          ],
        });

      const res = await request(app)
        .get(`/api/settlements/room/${roomId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalExpenses).toBe(1000);
      
      const balances = res.body.data.balances;
      const b1 = balances.find((b: any) => b.userId === user1Id);
      const b2 = balances.find((b: any) => b.userId === user2Id);
      
      expect(b1.balance).toBe(500);
      expect(b2.balance).toBe(-500);

      // Suggestions: User 2 owes User 1 500
      const settlements = res.body.data.settlements;
      expect(settlements.length).toBe(1);
      expect(settlements[0].from.id).toBe(user2Id);
      expect(settlements[0].to.id).toBe(user1Id);
      expect(settlements[0].amount).toBe(500);
    });

    it("should record a settlement payment and resolve recommendation", async () => {
      // User 1 pays 1000, splits 500 each
      await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          roomId,
          title: "Electricity",
          amount: 1000,
          category: "UTILITIES",
          splits: [
            { userId: user1Id, amount: 500 },
            { userId: user2Id, amount: 500 },
          ],
        });

      // User 2 pays back User 1 500 (records settlement payment)
      const settleRes = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          roomId,
          title: "Settlement payment",
          amount: 500,
          category: "OTHER",
          isSettlement: true,
          splits: [
            { userId: user1Id, amount: 500 },
          ],
        });

      expect(settleRes.status).toBe(201);
      expect(settleRes.body.data.isSettlement).toBe(true);

      // Recalculate settlement - balances should be 0, suggestions empty
      const res = await request(app)
        .get(`/api/settlements/room/${roomId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      const b1 = res.body.data.balances.find((b: any) => b.userId === user1Id);
      const b2 = res.body.data.balances.find((b: any) => b.userId === user2Id);
      
      expect(b1.balance).toBe(0);
      expect(b2.balance).toBe(0);
      expect(res.body.data.settlements.length).toBe(0);
      // Settlements are excluded from totalExpenses metric
      expect(res.body.data.totalExpenses).toBe(1000);
    });
  });
});
