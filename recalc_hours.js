const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

function calculateHours(checkIn, checkOut) {
  const iraqCheckIn = new Date(checkIn.getTime() + 3 * 60 * 60 * 1000);
  
  const officialStart = new Date(Date.UTC(
    iraqCheckIn.getUTCFullYear(),
    iraqCheckIn.getUTCMonth(),
    iraqCheckIn.getUTCDate(),
    6, 0, 0, 0
  ));

  const officialEnd = new Date(Date.UTC(
    iraqCheckIn.getUTCFullYear(),
    iraqCheckIn.getUTCMonth(),
    iraqCheckIn.getUTCDate(),
    15, 0, 0, 0
  ));

  let officialMs = 0;
  let overtimeMs = 0;

  if (checkOut) {
    const actualStart = checkIn < officialStart ? officialStart : checkIn;
    const actualEnd = checkOut > officialEnd ? officialEnd : checkOut;

    if (actualEnd > actualStart) {
      officialMs = actualEnd.getTime() - actualStart.getTime();
    }

    const totalMs = checkOut.getTime() - checkIn.getTime();
    overtimeMs = totalMs > officialMs ? totalMs - officialMs : 0;
  }

  const officialHours = officialMs / (1000 * 60 * 60);
  const overtimeHours = overtimeMs / (1000 * 60 * 60);

  return { officialHours, overtimeHours };
}

async function main() {
  const records = await prisma.attendance.findMany();
  console.log(`Found ${records.length} records. Recalculating...`);
  let updated = 0;
  
  for (const record of records) {
    if (record.checkOut) {
      const { officialHours, overtimeHours } = calculateHours(record.checkIn, record.checkOut);
      if (record.officialHours !== officialHours || record.overtimeHours !== overtimeHours) {
        await prisma.attendance.update({
          where: { id: record.id },
          data: { officialHours, overtimeHours }
        });
        updated++;
      }
    }
  }
  
  console.log(`Successfully updated ${updated} records!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
