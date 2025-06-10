import app from './app';
import { env } from './config/env';

const port = env.PORT;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} (${env.NODE_ENV})`);
}); 