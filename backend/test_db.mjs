const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/kaichon-plus', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const db = mongoose.connection.db;
    const fathers = await db.collection('fathers').find({}, { projection: { image: 1, _id: 1, name: 1 } }).limit(2).toArray();
    console.log(JSON.stringify(fathers, null, 2).substring(0, 500));
    mongoose.connection.close();
  });
