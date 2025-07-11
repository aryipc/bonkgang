

import { NextResponse, type NextRequest } from 'next/server';

// This testing endpoint has been disabled for production.
// Any requests to it will now result in a 404 Not Found error.

export async function POST(request: NextRequest) {
    return NextResponse.json(
        { message: "Endpoint not found." },
        { status: 404 }
    );
}


export async function GET(request: NextRequest) {
    return NextResponse.json(
        { message: "Endpoint not found." },
        { status: 404 }
    );
}
