import { createApp, fromNodeMiddleware, toWebHandler } from "h3";

let handler: ((request: Request) => Promise<Response>) | undefined;

function apiErrorResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : "API failed to start";
  console.error("API error:", error);
  return Response.json({ ok: false, error: message }, { status: 500 });
}

export async function handleApiRequest(request: Request): Promise<Response> {
  try {
    if (!handler) {
      const { getServerlessApp } = await import("../../backend/src/serverless");
      const expressApp = await getServerlessApp();
      const app = createApp();
      app.use(fromNodeMiddleware(expressApp));
      handler = toWebHandler(app);
    }
    return await handler(request);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
