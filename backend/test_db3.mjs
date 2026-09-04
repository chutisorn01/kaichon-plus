import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/kaichon-plus')
  .then(async () => {
    const db = mongoose.connection.db;
    const father = await db.collection('fathers').findOne({ _id: new mongoose.Types.ObjectId("66d3a4365775f0a07e46635a") });
    console.log(father ? father.image?.substring(0, 50) : "Not found");
    mongoose.connection.close();
  });
