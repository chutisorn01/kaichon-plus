const mongoose = require('mongoose');
const { Chick } = require('./src/models/chick.model');
mongoose.connect('mongodb://localhost:27017/kaichon-plus').then(async () => {
  const chick = await Chick.findById('6a44979da78d7bb15cc9ff96');
  if (chick) {
    console.log("Current status:", chick.status);
    const updated = await Chick.findOneAndUpdate({_id: '6a44979da78d7bb15cc9ff96'}, {status: 'พร้อมออกชน'}, {new: true});
    console.log("Updated status:", updated.status);
  } else {
    console.log("Chick not found in Chicks collection.");
  }
  process.exit(0);
});
