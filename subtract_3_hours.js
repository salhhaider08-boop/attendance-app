const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all attendance records...");
  const records = await prisma.attendance.findMany();
  
  console.log(`Found ${records.length} records. Updating...`);
  
  let updatedCount = 0;
  for (const record of records) {
    const newCheckIn = new Date(record.checkIn.getTime() - (3 * 60 * 60 * 1000));
    
    let newCheckOut = null;
    if (record.checkOut) {
      newCheckOut = new Date(record.checkOut.getTime() - (3 * 60 * 60 * 1000));
    }
    
    // We must also recalculate the officialHours and overtimeHours based on the new times!
    // But wait, the user's main issue is the *displayed* time in the UI, not the hours calculated.
    // If we shift both checkIn and checkOut by 3 hours, the *duration* is exactly the same!
    // So officialHours and overtimeHours don't necessarily need to change if the shift is uniform.
    // But let's recalculate them just to be 100% correct according to the 9AM-6PM Iraq time rules.
    
    // 9 AM Iraq time = 6 AM UTC
    // 6 PM Iraq time = 3 PM UTC
    const officialStart = new Date(newCheckIn);
    officialStart.setUTCHours(6, 0, 0, 0);

    const officialEnd = new Date(newCheckIn);
    officialEnd.setUTCHours(15, 0, 0, 0);

    let officialMs = 0;
    let overtimeMs = 0;

    if (newCheckOut) {
      const actualStart = newCheckIn < officialStart ? officialStart : newCheckIn;
      const actualEnd = newCheckOut > officialEnd ? officialEnd : newCheckOut;

      if (actualEnd > actualStart) {
        officialMs = actualEnd.getTime() - actualStart.getTime();
      }

      if (newCheckOut > officialEnd) {
        overtimeMs = newCheckOut.getTime() - officialEnd.getTime();
      }
    }

    const officialHours = officialMs / (1000 * 60 * 60);
    const overtimeHours = overtimeMs / (1000 * 60 * 60);
    
    await prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        officialHours: officialHours,
        overtimeHours: overtimeHours
      }
    });
    
    updatedCount++;
  }
  
  console.log(`Successfully updated ${updatedCount} records.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
