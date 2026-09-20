/**
 * MUTJAH Admin Account Manager CLI
 *
 * Usage:
 *   bun scripts/reset-admin.ts
 *   or:
 *   bun scripts/reset-admin.ts <email> <password>
 *
 * If no arguments are passed, it reads ADMIN_EMAIL and ADMIN_PASSWORD from .env.
 */
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = args[1] || process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.error("❌ خطأ: يرجى تحديد البريد الإلكتروني وكلمة المرور.");
    console.error("الاستخدام: bun scripts/reset-admin.ts <email> <password>");
    console.error("أو تأكد من وجود ADMIN_EMAIL و ADMIN_PASSWORD في ملف .env");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ خطأ: كلمة المرور يجب أن لا تقل عن 8 أحرف.");
    process.exit(1);
  }

  const existing = await db.adminUser.findUnique({
    where: { email },
  });

  const passwordHash = hashPassword(password);

  if (existing) {
    await db.adminUser.update({
      where: { id: existing.id },
      data: { passwordHash },
    });
    console.log(`✅ تم تحديث كلمة مرور المشرف بنجاح للحساب: ${email}`);
  } else {
    await db.adminUser.create({
      data: {
        email,
        passwordHash,
      },
    });
    console.log(`✅ تم إنشاء حساب المشرف الجديد بنجاح: ${email}`);
  }
}

main()
  .catch((err) => {
    console.error("❌ حدث خطأ أثناء إعداد الحساب:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
