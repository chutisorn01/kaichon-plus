const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/kaichon-plus')
  .then(async () => {
    const db = mongoose.connection.db;
    const doc = await db.collection('chickens').findOne({ _id: new mongoose.Types.ObjectId("6a4cf212c593ad34cc8c6773") });
    if (doc) {
      console.log('Found in chickens!');
      console.log('Has image?', !!doc.image);
      if (doc.image) {
        console.log('Image starts with:', doc.image.substring(0, 50));
        console.log('Image length:', doc.image.length);
      }
    } else {
      console.log('Not found in chickens. Checking fathers...');
      const father = await db.collection('fathers').findOne({ _id: new mongoose.Types.ObjectId("6a4cf212c593ad34cc8c6773") });
      if (father) {
        console.log('Found in fathers!');
        console.log('Has image?', !!father.image);
        if (father.image) {
          console.log('Image starts with:', father.image.substring(0, 50));
          console.log('Image length:', father.image.length);
        }
      }
    }
    process.exit(0);
  });
