import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Default password for all seeded users. Change after first login in production. */
const SEED_PASSWORD = process.env.SEED_PASSWORD || "Password123!";

async function ensureUser(
  email: string,
  username: string,
  name: string,
  role: "ADMIN" | "PRO" | "SECRETARY" | "WOCOM" | "IMAM" | "MEMBER",
  extra: { phone?: string; gender?: "MALE" | "FEMALE"; programOfStudy?: string; level?: string } = {}
) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role, username, name, passwordHash, ...extra },
    });
    return { email, username, created: false };
  }
  await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      name,
      role,
      phone: extra.phone ?? null,
      gender: extra.gender ?? null,
      programOfStudy: extra.programOfStudy ?? null,
      level: extra.level ?? null,
    },
  });
  return { email, username, created: true };
}

async function ensureMember(userId: string, status: "PENDING" | "APPROVED" = "APPROVED") {
  const existing = await prisma.member.findUnique({ where: { userId } });
  if (existing) {
    if (existing.status !== status) await prisma.member.update({ where: { userId }, data: { status } });
    return;
  }
  await prisma.member.create({ data: { userId, status } });
}

async function main() {
  console.log("Seeding GMSA UDS NYC...\n");
  console.log("Default password for all seeded users:", SEED_PASSWORD);
  console.log("(Set SEED_PASSWORD in .env to override.)\n");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmsa.edu.gh";
  const adminUsername = process.env.ADMIN_USERNAME || "admin";

  // 1. Admin
  const admin = await ensureUser(adminEmail, adminUsername, "GMSA Admin", "ADMIN", {
    phone: "+233240000001",
  });
  console.log(admin.created ? "Created admin" : "Updated admin", adminEmail, "| username:", adminUsername);

  // 2. PRO
  const pro = await ensureUser("pro@gmsa.edu.gh", "pro", "PRO User", "PRO", {
    phone: "+233240000002",
    gender: "MALE",
    programOfStudy: "BSc Information Technology",
  });
  console.log(pro.created ? "Created PRO" : "Updated PRO", pro.email);

  // 3. Secretary
  const sec = await ensureUser("secretary@gmsa.edu.gh", "secretary", "Secretary User", "SECRETARY", {
    phone: "+233240000003",
    gender: "FEMALE",
    programOfStudy: "BSc Computer Science",
  });
  console.log(sec.created ? "Created Secretary" : "Updated Secretary", sec.email);

  // 4. WOCOM
  const wocom = await ensureUser("wocom@gmsa.edu.gh", "wocom", "WOCOM User", "WOCOM", {
    phone: "+233240000004",
    gender: "FEMALE",
    programOfStudy: "BSc Development Studies",
  });
  console.log(wocom.created ? "Created WOCOM" : "Updated WOCOM", wocom.email);

  // 5. Imam
  const imam = await ensureUser("imam@gmsa.edu.gh", "imam", "Imam User", "IMAM", {
    phone: "+233240000005",
    gender: "MALE",
    programOfStudy: "Islamic Studies",
  });
  console.log(imam.created ? "Created Imam" : "Updated Imam", imam.email);

  // 6. Sample members (with Member records)
  const members = [
    { email: "member1@gmsa.edu.gh", username: "member1", name: "Ibrahim Mohammed", gender: "MALE" as const, programOfStudy: "BSc Agriculture", level: "300", phone: "+233241111111" },
    { email: "member2@gmsa.edu.gh", username: "member2", name: "Aisha Rahman", gender: "FEMALE" as const, programOfStudy: "BSc Nursing", level: "200", phone: "+233242222222" },
    { email: "member3@gmsa.edu.gh", username: "member3", name: "Omar Hassan", gender: "MALE" as const, programOfStudy: "BSc Computer Science", level: "400", phone: "+233243333333" },
    { email: "member4@gmsa.edu.gh", username: "member4", name: "Fatima Adams", gender: "FEMALE" as const, programOfStudy: "BSc Economics", level: "100", phone: "+233244444444" },
    { email: "member5@gmsa.edu.gh", username: "member5", name: "Yusuf Iddrisu", gender: "MALE" as const, programOfStudy: "BSc Information Technology", level: "200", phone: "+233245555555" },
  ];

  for (const m of members) {
    const u = await ensureUser(m.email, m.username, m.name, "MEMBER", {
      phone: m.phone,
      gender: m.gender,
      programOfStudy: m.programOfStudy,
      level: m.level,
    });
    if (u.created) {
      const user = await prisma.user.findUnique({ where: { email: m.email } });
      if (user) await ensureMember(user.id, "APPROVED");
    }
    console.log(u.created ? "Created member" : "Updated member", m.email, "| username:", m.username);
  }

  console.log("\n--- Seeded users (login with username or email) ---");
  console.log("Admin:    ", adminUsername, "or", adminEmail);
  console.log("PRO:      pro or pro@gmsa.edu.gh");
  console.log("Secretary: secretary or secretary@gmsa.edu.gh");
  console.log("WOCOM:    wocom or wocom@gmsa.edu.gh");
  console.log("Imam:     imam or imam@gmsa.edu.gh");
  console.log("Members:  member1 ... member5 (e.g. member1 / " + SEED_PASSWORD + ")");
  console.log("Password for all:", SEED_PASSWORD);
  console.log("------------------------------------\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
