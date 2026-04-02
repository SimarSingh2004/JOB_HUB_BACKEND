
import "dotenv/config"; 

import mongoose from "mongoose";
import { app } from "./app.js";

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`).then(() => {
      console.log("Connected to MongoDb");
    });
    app.on("error", (error) => {
      console.log("Error ", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Error ", error);
    throw error;
  }
})();
