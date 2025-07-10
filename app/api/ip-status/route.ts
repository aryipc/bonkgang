
import { NextResponse, type NextRequest } from 'next/server';
import { readIpUsage, type IpUsage } from '@/app/api/lib/db';

export const dynamic = 'force-dynamic'; // Ensures the route is always executed dynamically.

const defaultUsage: IpUsage = {
    totalSubmissions: 0,
    submittedGangs: [],
};

export async function GET(request: NextRequest) {
    // It's crucial to get the IP address correctly, especially when deployed.
    // `request.ip` is the recommended way in Next.js and Vercel.
    const ip = request.ip ?? '127.0.0.1';

    try {
        const ipUsageData = await readIpUsage();
        const userUsage = ipUsageData[ip] || defaultUsage;

        return NextResponse.json(userUsage);

    } catch (error) {
        console.error("API route /api/ip-status failed to read DB:", error);
        
        let message = "Service is temporarily unavailable due to a database error.";
        // Check for a specific configuration error message from @vercel/kv
        if (error instanceof Error && error.message.includes('@vercel/kv: Missing required environment variable')) {
            message = "The application is not configured correctly to connect to the database. Please contact the site administrator.";
        }
        
        // Return an explicit error instead of default data to prevent unexpected UI behavior.
        return NextResponse.json(
            { message },
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}