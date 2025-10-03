const { configDotenv } = require('dotenv');
configDotenv
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;
connectDB();

app.get('/health', (req, res) => {
  return res.status(200).json("status : OK");
})

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});