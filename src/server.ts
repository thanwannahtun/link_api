import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
