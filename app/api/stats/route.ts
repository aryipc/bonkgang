
import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join('/tmp', 'db.json');

type Stats = {
    [key: string]: number;
};

export async function GET() {
    try {
        await fs.access(dbPath); // Check if file exists
        const data = await fs.readFile(dbPath, 'utf8');
        const stats: Stats = JSON.parse(data);
        return new Response(JSON.stringify(stats), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        // If file doesn't exist, create it and return default stats
        const defaultStats: Stats = { og_bonkgang: 0, hung_hing: 0, street_gang: 0 };
        try {
            await fs.writeFile(dbPath, JSON.stringify(defaultStats, null, 2), 'utf8');
            return new Response(JSON.stringify(defaultStats), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (writeError) {
             console.error("Failed to create stats DB:", writeError);
             return new Response(JSON.stringify({ message: "Failed to initialize stats database." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }
}