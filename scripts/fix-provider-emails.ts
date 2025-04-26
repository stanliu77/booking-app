// scripts/fix-provider-emails.ts
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

async function fixProviderEmails() {
  const providers = await db.user.findMany({
    where: {
      role: "PROVIDER",
      email: "placeholder@example.com", // 只修复 placeholder 的
    },
  });

  console.log(`Found ${providers.length} providers to fix.`);

  const clerk = await clerkClient();

  for (const provider of providers) {
    try {
      const clerkUser = await clerk.users.getUser(provider.clerkId);
      const realEmail = clerkUser.emailAddresses[0]?.emailAddress;

      if (!realEmail) {
        console.warn(`No email found for ${provider.clerkId}, skipping...`);
        continue;
      }

      await db.user.update({
        where: { id: provider.id },
        data: { email: realEmail },
      });

      console.log(`✅ Updated ${provider.id} with ${realEmail}`);
    } catch (err) {
      console.error(`❌ Failed to update ${provider.id}`, err);
    }
  }

  console.log("🔧 Email fix complete!");
}

fixProviderEmails();
