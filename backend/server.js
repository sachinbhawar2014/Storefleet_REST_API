import server from "./app.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import path from "path";

const configPath = path.resolve("config", "uat.env");
dotenv.config({ path: configPath });

console.log(process.env.PORT);
const serverStar = server.listen(process.env.PORT, async (err) => {
  if (err) {
    console.log(`server failed with error ${err}`);
  } else {
    await connectDB();
    console.log(`server is running at http://localhost:${process.env.PORT}`);
  }
});
