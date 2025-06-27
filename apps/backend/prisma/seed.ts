import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 테스트 사용자 생성
  const testUser = await prisma.user.upsert({
    where: { email: 'test@daon.com' },
    update: {},
    create: {
      email: 'test@daon.com',
      name: '테스트 부모',
      password: 'hashedpassword', // 실제로는 bcrypt로 해시된 비밀번호
      role: 'PARENT',
    },
  });

  // 테스트 아이 생성
  const testChild = await prisma.child.upsert({
    where: { id: 'test-child-id' },
    update: {},
    create: {
      id: 'test-child-id',
      name: '다온이',
      birthDate: new Date('2024-01-01'),
      gender: 'MALE',
      birthWeight: 3.2,
      birthHeight: 50.0,
      parentId: testUser.id,
    },
  });

  // 테스트 활동 기록 생성
  const testActivity = await prisma.activity.create({
    data: {
      childId: testChild.id,
      userId: testUser.id,
      type: 'FEEDING',
      timestamp: new Date(),
      notes: '모유 수유',
      feedingData: {
        create: {
          type: 'BREAST',
          duration: 15,
          side: 'LEFT',
        },
      },
    },
  });

  console.log('Seed completed successfully');
  console.log({
    user: testUser,
    child: testChild,
    activity: testActivity,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });