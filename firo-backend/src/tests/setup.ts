process.env.NODE_ENV = "test";
import mongoose from "mongoose";
import { env } from "../config/env";

export const connectTestDb = async () => {
  let uri = env.MONGODB_URI;
  if (uri.includes("/FIRO?")) {
    uri = uri.replace("/FIRO?", "/FIRO_TEST?");
  } else if (uri.includes("/FIRO")) {
    uri = uri.replace("/FIRO", "/FIRO_TEST");
  } else {
    uri = uri + "_test";
  }
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
};

export const clearTestDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

export const closeTestDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.db?.dropDatabase();
    await mongoose.disconnect();
  }
};
