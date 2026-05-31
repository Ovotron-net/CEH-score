import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import type { ViteDevServer } from 'vite';
import assessmentsRouter from './src/server/routes/assessments.js';
import settingsRouter from './src/server/routes/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT ?? 3000);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const destructiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

async function createServer() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '50kb' }));
  app.use('/api', apiLimiter);
  app.post('/api/assessments', destructiveLimiter);
  app.delete('/api/assessments', destructiveLimiter);
  app.delete('/api/assessments/:id', destructiveLimiter);
  app.use('/api/assessments', assessmentsRouter);
  app.use('/api/settings', settingsRouter);

  let vite: ViteDevServer | undefined;
  let prodTemplate: string | undefined;
  let prodRender: ((url: string) => { html: string }) | undefined;

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist/client'), { index: false }));
    prodTemplate = fs.readFileSync(
      path.resolve(__dirname, 'dist/client/index.html'),
      'utf-8',
    );
    ({ render: prodRender } = await import('./dist/server/entry-server.js'));
  } else {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  }

  app.use('/{*splat}', async (req, res) => {
    const url = req.originalUrl;

    try {
      let template: string;
      let render: (url: string) => { html: string };

      if (isProd) {
        template = prodTemplate!;
        render = prodRender!;
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite!.transformIndexHtml(url, template);
        ({ render } = await vite!.ssrLoadModule('/src/entry-server.tsx'));
      }

      const { html: appHtml } = render(url);
      const html = template.replace('<!--app-html-->', appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    } catch (err) {
      vite?.ssrFixStacktrace(err as Error);
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

createServer();

