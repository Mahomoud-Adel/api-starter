import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './config/routes';
import { notFound, errorHandler } from './core/errors/errorHandler';

const app = express();
app.use(helmet(), cors(), morgan('dev'), express.json());
app.use('/api', routes);
app.use(notFound, errorHandler);

export default app;