
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
        console.error("Failed to read IP usage stats:", error);
        // Return default usage on error to avoid blocking the UI
        return NextResponse.json(defaultUsage, { status: 500 });
    }
}