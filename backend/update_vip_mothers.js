import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/kaichon-plus');
  const db = mongoose.connection.db;
  
  const result = await db.collection('mothers').updateMany(
    { name: { $regex: ' \\(VIP\\)$' } },
    { $set: { source: 'ไก่ฟาร์มอื่น (ลูกค้า VIP)' } }
  );
  console.log(`Updated ${result.modifiedCount} mothers`);
  process.exit(0);
}
run();
