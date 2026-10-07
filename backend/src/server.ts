import cors from "cors";
import express from "express";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/hello", (_request, response) => {
  response.json({ message: "Hello, World!" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend disponível em http://localhost:${port}`);
});
