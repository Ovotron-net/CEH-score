import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import type { ViteDevServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT ?? 3000);

async function createServer() {
  const app = express();

  let vite: ViteDevServer | undefined;

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist/client'), { index: false }));
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
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8',
        );
        ({ render } = await import('./dist/server/entry-server.js'));
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
      res.status(500).send((err as Error).message);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

createServer();
