import { createServer } from 'vite';

async function start() {
  try {
    console.log("Creating Vite server in dashboard...");
    const server = await createServer({
      server: { port: 3000 }
    });
    console.log("Listening...");
    await server.listen();
    server.printUrls();
  } catch (err) {
    console.error("Vite start error:", err);
  }
}

start();
