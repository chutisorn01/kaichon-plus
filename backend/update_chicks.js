const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/kaichon-plus');
const chickSchema = new mongoose.Schema({}, { strict: false, collection: 'chicks' });
const Chick = mongoose.model('Chick', chickSchema);

async function run() {
  const chicks = await Chick.find();
  let count = 0;
  for (let c of chicks) {
    let newName = c.name;
    if (newName && newName.includes('เจ้าชาย')) {
      newName = newName.replace('เจ้าชาย', '♂ ขุนศึก');
    }
    if (newName && newName.includes('เจ้าหญิง')) {
      newName = newName.replace('เจ้าหญิง', '♀ นางพญา');
    }
    if (newName !== c.name) {
      await Chick.updateOne({ _id: c._id }, { $set: { name: newName } });
      count++;
    }
  }
  console.log(`Updated ${count} chicks.`);
  process.exit(0);
}
run();
