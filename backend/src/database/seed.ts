import { prisma } from './index';

async function main() {
  console.log('Seeding database...');

  // No seed data needed for this application as it's all user-generated
  // But we can create a sample QR code for testing
  const sampleQR = await prisma.qRCode.create({
    data: {
      slug: 'sample-qr',
      mode: 'REDIRECT',
      content: 'https://example.com',
      targetUrl: 'https://example.com',
      options: {
        size: 512,
        color: '#000000',
        background: '#FFFFFF',
        errorCorrection: 'H'
      },
      ownerEditTokenHash: 'sample-hash',
      active: true,
    },
  });

  console.log('Sample QR created:', sampleQR.slug);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });