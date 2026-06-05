import { createApp, fromNodeMiddleware, toWebHandler } from "h3";

let handler: ((request: Request) => Promise<Response>) | undefined;

export async function handleApiRequest(request: Request): Promise<Response> {
  if (!handler) {
    const { getServerlessApp } = await import("../../backend/src/serverless");
    const expressApp = await getServerlessApp();
    const app = createApp();
    app.use(fromNodeMiddleware(expressApp));
    handler = toWebHandler(app);
  }
  return handler(request);
}
