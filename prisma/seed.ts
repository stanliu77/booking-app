// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始填充数据...");

  // 1. 创建 10 个服务提供者
  const providers = [];
  for (let i = 0; i < 10; i++) {
    const provider = await prisma.user.create({
      data: {
        clerkId: `provider-${i}`,
        email: `provider${i}@example.com`,
        role: "PROVIDER",
      },
    });
    providers.push(provider);
  }

  // 2. 创建 10 个普通用户
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        clerkId: `user-${i}`,
        email: `user${i}@example.com`,
        role: "USER",
      },
    });
    users.push(user);
  }

  // 3. 每个提供者创建 2 个服务
  const services = [];
  for (const provider of providers) {
    for (let j = 0; j < 2; j++) {
      const service = await prisma.service.create({
        data: {
          name: faker.company.name(),
          description: faker.lorem.sentence(),
          price: parseFloat(faker.commerce.price({ min: 20, max: 100 })),
          duration: 30,
          imageUrl: faker.image.urlLoremFlickr({ width: 300, height: 200, category: 'business' }),
          providerId: provider.id,
        },
      });
      services.push(service);

      // 4. 为每个服务添加 3 个时间段
      for (let k = 0; k < 3; k++) {
        const start = faker.date.soon({ days: 10 });
        await prisma.timeSlot.create({
          data: {
            serviceId: service.id,
            start,
            end: new Date(start.getTime() + 30 * 60000), // 30 分钟
          },
        });
      }
    }
  }

  // 5. 创建 50 条预约记录
  for (let i = 0; i < 50; i++) {
    const user = faker.helpers.arrayElement(users);
    const service = faker.helpers.arrayElement(services);
    const provider = providers.find((p) => p.id === service.providerId);
    const datetime = faker.date.soon({ days: 10 });

    await prisma.appointment.create({
      data: {
        userId: user.id,
        providerId: provider!.id,
        serviceId: service.id,
        datetime,
        status: "PENDING",
        isPaid: faker.datatype.boolean(),
        isCompleted: false,
      },
    });
  }

  console.log("✅ 数据填充完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
