
import { NextResponse, type NextRequest } from 'next/server';
import { readGalleryEntries } from '@/app/api/lib/db';

export const dynamic = 'force-dynamic'; // Ensures the route is always executed dynamically.

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '24', 10); // Default to 24 items per page

        if (page < 1 || limit < 1) {
            return NextResponse.json({ message: "Invalid page or limit parameter." }, { status: 400 });
        }

        const allEntries = await readGalleryEntries();
        const totalEntries = allEntries.length;
        const totalPages = Math.ceil(totalEntries / limit);

        const startIndex = (page - 1) * limit;
        const paginatedEntries = allEntries.slice(startIndex, startIndex + limit);

        return NextResponse.json({
            entries: paginatedEntries,
            totalPages,
            currentPage: page,
            totalEntries
        });
        
    } catch (error) {
         console.error("API route /api/gallery failed to read DB:", error);
         
         let message = "Service is temporarily unavailable due to a database error.";
         // Check for a specific configuration error message from @vercel/kv
         if (error instanceof Error && error.message.includes('@vercel/kv: Missing required environment variable')) {
             message = "Configuration Error: The application is missing required Vercel KV database environment variables. Please check your project's deployment settings.";
         }

         return NextResponse.json(
            { message },
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
