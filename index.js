import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import useragent from "express-useragent"; // Middleware for parsing
import { router } from "./routes.js";
dotenv.config();


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(useragent.express());




app.use("/", router);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
