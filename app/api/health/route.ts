import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const wsEndpoint = process.env.BROWSERLESS_WS_ENDPOINT;
  
  return NextResponse.json({
    hasEndpoint: !!wsEndpoint,
    endpointLength: wsEndpoint?.length || 0,
    endpointPreview: wsEndpoint ? wsEndpoint.substring(0, 30) + "..." : "Not set",
    nodeEnv: process.env.NODE_ENV,
  });
}
