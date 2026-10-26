import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Subject } from 'rxjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// RxJS Subject for internal asynchronous reactive event processing
export const eventBus$ = new Subject<{ type: string; payload: unknown }>();

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TypeScript Server running on port ${PORT}`));
