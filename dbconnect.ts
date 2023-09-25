import mongoose,{ connection } from "mongoose"
const url = `mongodb+srv://${process.env.mongokey}/lotterybot?retryWrites=true&w=majority`;
export default async function db() {
  await mongoose.connect(url);
}