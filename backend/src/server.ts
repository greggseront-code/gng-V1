import { app } from './app';
import { getDb } from './db/db.connection';

const PORT = process.env.PORT ?? '3000';

getDb();

app.listen(Number(PORT), () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
