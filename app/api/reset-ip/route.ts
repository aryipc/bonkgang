
import { NextResponse } from 'next/server';

export async function POST() {
    // This endpoint was for testing purposes and has been disabled
    // to ensure the integrity of user submission limits in production.
    return NextResponse.json(
        { message: "This functionality is disabled." },
        { status: 403 } // 403 Forbidden
    );
}

// The GET method can be removed or disabled as well if it exists,
// but for this endpoint, only POST was used for the reset action.
export async function GET() {
    return NextResponse.json(
        { message: "This functionality is disabled." },
        { status: 403 }
    );
}
