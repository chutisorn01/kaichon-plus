import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const chickSchema = new mongoose.Schema({}, { strict: false });
const Chick = mongoose.model('Chick', chickSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const chick = await Chick.findById('6a91aee043bfedde39fe0cbc');
  if (chick) {
    const doc = chick.toObject();
    console.log('Chick found!');
    console.log('Has image?', !!doc.image);
    if (doc.image) {
      console.log('Image length:', doc.image.length);
      console.log('Prefix:', doc.image.substring(0, 50));
    }
  } else {
    console.log('Chick not found');
  }
  mongoose.disconnect();
}
run();
