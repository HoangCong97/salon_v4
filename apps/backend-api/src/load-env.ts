import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from root .env with multiple fallbacks
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

console.log("DATABASE_URL loaded in load-env.ts:", process.env.DATABASE_URL);
