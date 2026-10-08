import app from './app';
import { env } from './core/config/env';

app.listen(env.PORT, () => console.log(`Server running on :${env.PORT}`));