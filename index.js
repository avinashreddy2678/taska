import express from "express";
import Cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { AuthRoute } from "./routes/authRoute.js";
import { ProductRouter } from "./routes/productRoute.js";
import { GroupRouter } from "./routes/groupRouter.js";
const app = express();
app.use(Cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

dotenv.config();
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log("connected failed", err);
  });

app.use("/", AuthRoute);
app.use("/product", ProductRouter);
app.use("/group", GroupRouter);

app.listen(4000, () => {
  console.log("Server is running");
});
