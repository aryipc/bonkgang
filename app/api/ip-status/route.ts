
import { NextResponse, type NextRequest } from 'next/server';
import { readIpUsageForIp, type IpUsage } from '@/app/api/lib/db';

export const dynamic = 'force-dynamic'; // Ensures the route is always executed dynamically.

const defaultUsage: IpUsage = {
    totalSubmissions: 0,
    submittedGangs: [],
};

export async function GET(request: NextRequest) {
    const ip = (request.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();

    try {
        const userUsage = await readIpUsageForIp(ip);
        
        return NextResponse.json(userUsage || defaultUsage);

    } catch (error) {
        console.error("API route /api/ip-status failed to read DB:", error);
        
        let message = "Service is temporarily unavailable due to a database error.";
        if (error instanceof Error && error.message.includes('@vercel/kv: Missing required environment variable')) {
            message = "Configuration Error: The application is missing required Vercel KV database environment variables. Please check your project's deployment settings.";
        }
        
        return NextResponse.json(
            { message },
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
