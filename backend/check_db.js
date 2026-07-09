const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/kaichon-plus');
  const db = mongoose.connection.db;
  
  const batches = await db.collection('breedingbatches').find({}).toArray();
  console.log('--- BATCHES ---');
  batches.forEach(b => console.log(`ID: ${b._id}, batchCode: ${b.batchCode}`));
  
  const chicks = await db.collection('chicks').find({}).toArray();
  console.log('--- CHICKS ---');
  chicks.forEach(c => {
    if (String(c.batch).length === 24 || String(c.code).length === 24 || String(c.name).includes('6a4')) {
      console.log(`CHICK: ID: ${c._id}, name: ${c.name}, code: ${c.code}, batch: ${c.batch}`);
    }
  });
  
  process.exit(0);
}

check().catch(console.error);
