import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`IncluNiv Backend berjalan di port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});