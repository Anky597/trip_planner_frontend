import { NextRequest } from "next/server";

// Target backend (EC2) base URL. Keep path clean, always end without trailing slash.
const BACKEND_BASE = "http://13.201.34.44:7878/api/v1";

function buildTargetUrl(req: NextRequest, path: string[]) {
  const search = req.nextUrl.search || "";
  const joined = path.join("/");
  return `${BACKEND_BASE}/${joined}${search}`;
}

async function forward(
  req: NextRequest,
  method: string,
  path: string[],
) {
  const url = buildTargetUrl(req, path);
  const headers: Record<string, string> = {
    "content-type": req.headers.get("content-type") || "application/json",
  };

  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.text();

  const res = await fetch(url, {
    method,
    headers,
    body,
    // Prevent caching on proxy
    cache: "no-store",
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, "GET", params.path || []);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, "POST", params.path || []);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, "PUT", params.path || []);
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, "PATCH", params.path || []);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, "DELETE", params.path || []);
}


