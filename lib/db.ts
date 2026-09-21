import mongoose from "mongoose";
import { env } from "./env";

const globalForMongoose = global as unknown as {
  mongooseConn?: typeof mongoose | null;
  mongoosePromise?: Promise<typeof mongoose> | null;
};

export async function connectDb() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }
  if (globalForMongoose.mongooseConn) return globalForMongoose.mongooseConn;
  if (!globalForMongoose.mongoosePromise) {
    globalForMongoose.mongoosePromise = mongoose.connect(env.MONGODB_URI, {
      autoIndex: env.NODE_ENV !== "production",
      dbName: "sadikticket",
      serverSelectionTimeoutMS: 1500,
      socketTimeoutMS: 2000,
    });
  }
  try {
    globalForMongoose.mongooseConn = await globalForMongoose.mongoosePromise;
  } catch (err) {
    // Allow retry on next call instead of caching a rejected promise forever
    globalForMongoose.mongoosePromise = null;
    throw err;
  }
  return globalForMongoose.mongooseConn;
}
