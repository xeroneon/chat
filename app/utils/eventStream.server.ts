import { LoaderFunctionArgs } from "@remix-run/node";

type LoaderRequest = LoaderFunctionArgs["request"];

export function eventStream(
  request: LoaderRequest,
  setup: (send: (data: any) => void) => () => void
) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const cleanup = setup(send);

      request.signal.addEventListener("abort", () => {
        cleanup();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
