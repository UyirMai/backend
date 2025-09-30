import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import useragent from "express-useragent"; // Middleware for parsing
import { router } from "./routes.js";
dotenv.config();


const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(useragent.express());
app.use("/uploads", express.static("uploads")); // serve uploads folder
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  console.log("Body:", req.body);
  next();
});



app.use("/", router);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
