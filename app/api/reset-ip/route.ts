<<<<<<< HEAD

import { NextResponse, type NextRequest } from 'next/server';
import { readIpUsage, writeIpUsage, type IpUsageData } from '@/app/api/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const ip = request.ip ?? '127.0.0.1';

    if (!ip) {
        return NextResponse.json({ message: "Could not determine IP address." }, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const ipUsageData: IpUsageData = await readIpUsage();
        
        if (ipUsageData[ip]) {
            delete ipUsageData[ip];
            await writeIpUsage(ipUsageData);
            return NextResponse.json({ message: `IP usage for ${ip} has been reset.` });
        } else {
            return NextResponse.json({ message: `No usage data found for IP ${ip}.` });
        }

    } catch (error) {
        console.error("API route /api/reset-ip failed to write to DB:", error);
         
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
=======
export {};
>>>>>>> e2f6cc657ea60c98d5df23db2a89353c6dd5b44d
