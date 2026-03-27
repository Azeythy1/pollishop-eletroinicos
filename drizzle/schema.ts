import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// iPhone models enum
export const iphoneModelEnum = mysqlEnum("model", [
  "iPhone 11",
  "iPhone 11 Pro",
  "iPhone 11 Pro Max",
  "iPhone 12",
  "iPhone 12 Mini",
  "iPhone 12 Pro",
  "iPhone 12 Pro Max",
  "iPhone 13",
  "iPhone 13 Mini",
  "iPhone 13 Pro",
  "iPhone 13 Pro Max",
  "iPhone 14",
  "iPhone 14 Plus",
  "iPhone 14 Pro",
  "iPhone 14 Pro Max",
  "iPhone 15",
  "iPhone 15 Plus",
  "iPhone 15 Pro",
  "iPhone 15 Pro Max",
  "iPhone 16",
  "iPhone 16 Plus",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max",
  "iPhone 17",
  "iPhone 17 Plus",
  "iPhone 17 Pro",
  "iPhone 17 Pro Max",
]);

export const iphones = mysqlTable("iphones", {
  id: int("id").autoincrement().primaryKey(),
  model: varchar("model", { length: 64 }).notNull(),
  storage: varchar("storage", { length: 16 }).notNull(), // 64GB, 128GB, 256GB, 512GB, 1TB
  color: varchar("color", { length: 64 }),
  batteryHealth: int("batteryHealth").notNull(), // percentage 0-100
  repairs: text("repairs"), // description of repairs done
  condition: mysqlEnum("condition", ["excelente", "bom", "regular"]).default("bom").notNull(),

  // Pricing
  costPrice: decimal("costPrice", { precision: 10, scale: 2, mode: "number" }).notNull(), // visible only to admin
  priceAdjustType: mysqlEnum("priceAdjustType", ["percentage", "fixed"]).default("percentage").notNull(),
  priceAdjustValue: decimal("priceAdjustValue", { precision: 10, scale: 2, mode: "number" }).notNull(), // % or R$ added to cost
  cashPrice: decimal("cashPrice", { precision: 10, scale: 2, mode: "number" }).notNull(), // calculated: cost + adjustment

  // Installment config: JSON array of { installments: number, rateId: number }
  installmentConfig: json("installmentConfig"), // which installment options to show

  // Status
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  notes: text("notes"), // internal notes

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Iphone = typeof iphones.$inferSelect;
export type InsertIphone = typeof iphones.$inferInsert;

export const iphonePhotos = mysqlTable("iphone_photos", {
  id: int("id").autoincrement().primaryKey(),
  iphoneId: int("iphoneId").notNull().references(() => iphones.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IphonePhoto = typeof iphonePhotos.$inferSelect;
export type InsertIphonePhoto = typeof iphonePhotos.$inferInsert;

export const installmentRates = mysqlTable("installment_rates", {
  id: int("id").autoincrement().primaryKey(),
  installments: int("installments").notNull(), // number of installments (2, 3, 4, ... 18)
  rate: decimal("rate", { precision: 5, scale: 2, mode: "number" }).notNull(), // interest rate in %
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstallmentRate = typeof installmentRates.$inferSelect;
export type InsertInstallmentRate = typeof installmentRates.$inferInsert;
