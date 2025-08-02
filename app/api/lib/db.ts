
// --- Type Definitions ---
export type Stats = {
    [key: string]: number;
};

export interface IpUsage {
    totalSubmissions: number;
    submittedGangs: string[];
}

export type IpUsageData = {
    [ip: string]: IpUsage;
};


// --- DB Keys ---
const STATS_KEY = 'bonk_gang_stats';
const IP_USAGE_KEY = 'bonk_gang_ip_usage';


// --- Default Data ---
const defaultStats: Stats = { og_bonkgang: 0, ghz: 0, street_gang: 0 };
const defaultIpUsageData: IpUsageData = {};

/**
 * Bypasses the Vercel Data Cache by fetching directly from the KV REST API 
 * with a 'no-store' cache policy. This ensures reads are always fresh, which is
 * crucial when data is updated outside the application (e.g., in the Upstash console).
 * @param key The key to read from Vercel KV.
 * @returns The parsed data or null if not found or an error occurs.
 */
async function readFromKv<T>(key: string): Promise<T | null> {
    const url = process.env.KV2_KV_REST_API_URL;
    const token = process.env.KV2_KV_REST_API_TOKEN;

    if (!url || !token) {
        const errorMsg = '@vercel/kv: Missing required environment variables KV2_KV_REST_API_URL or KV2_KV_REST_API_TOKEN.';
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    try {
        const response = await fetch(`${url}/get/${key}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            // This is the crucial part: it bypasses Vercel's default 30-second data cache.
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error(`Failed to fetch key "${key}" from Vercel KV REST API. Status: ${response.status}`);
            return null;
        }

        const data = await response.json();
        // The KV REST API returns the value as a JSON-stringified string in the 'result' field.
        if (data.result) {
            return JSON.parse(data.result) as T;
        }
        return null;

    } catch (error) {
        console.error(`Error fetching directly from KV REST API for key "${key}":`, error);
        return null;
    }
}

/**
 * Writes a value to a key in Vercel KV using the REST API.
 * This ensures consistency with the cache-bypassing read implementation.
 * @param key The key to write to in Vercel KV.
 * @param value The value to write. It will be JSON.stringified.
 */
async function writeToKv<T>(key: string, value: T): Promise<void> {
    const url = process.env.KV2_KV_REST_API_URL;
    const token = process.env.KV2_KV_REST_API_TOKEN;

    if (!url || !token) {
        const errorMsg = '@vercel/kv: Missing required environment variables KV2_KV_REST_API_URL or KV2_KV_REST_API_TOKEN.';
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    try {
        const response = await fetch(`${url}/set/${key}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(value),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to write key "${key}" to Vercel KV REST API. Status: ${response.status}. Body: ${errorText}`);
            throw new Error(`Failed to write key "${key}" to KV store.`);
        }

        const data = await response.json();
        if (data.result !== 'OK') {
            console.error(`KV REST API returned non-OK result for set operation on key "${key}":`, data.result);
            throw new Error(`KV REST API returned an unexpected result for set operation.`);
        }
    } catch (error) {
        console.error(`Error writing directly to KV REST API for key "${key}":`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`An unknown error occurred while writing to key "${key}" in KV store.`);
    }
}


// --- Stats DB Functions ---

export async function readStats(): Promise<Stats> {
    // Replaced kv.get with our cache-bypassing implementation.
    const stats = await readFromKv<Stats>(STATS_KEY);
    return stats ?? defaultStats;
}

export async function writeStats(stats: Stats): Promise<void> {
    await writeToKv(STATS_KEY, stats);
}


// --- IP Usage DB Functions ---

export async function readIpUsage(): Promise<IpUsageData> {
    // Replaced kv.get with our cache-bypassing implementation.
    const data = await readFromKv<IpUsageData>(IP_USAGE_KEY);
    return data ?? defaultIpUsageData;
}

export async function writeIpUsage(data: IpUsageData): Promise<void> {
    await writeToKv(IP_USAGE_KEY, data);
}