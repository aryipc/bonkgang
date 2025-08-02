
// --- Type Definitions ---
export type Stats = {
    [key: string]: number;
};

export interface IpUsage {
    totalSubmissions: number;
    submittedGangs: string[];
}

export interface GalleryEntry {
    id: string;
    imageUrl: string;
    gang: string;
    createdAt: string;
}


// --- DB Keys ---
const STATS_KEY = 'bonk_gang_stats';
const GALLERY_KEY = 'bonk_gang_gallery';
const IP_KEY_PREFIX = 'ip:'; // Prefix for scalable IP keys


// --- Default Data ---
const defaultStats: Stats = { og_bonkgang: 0, ghz: 0, street_gang: 0 };


/**
 * Executes a command against the Vercel KV REST API.
 * This provides a flexible way to run various Redis commands.
 * @param command The Redis command to execute (e.g., 'lpush', 'lrange').
 * @param args The arguments for the command, including the key.
 * @returns The parsed data from the 'result' field of the API response.
 */
async function executeKvCommand<T>(command: string, ...args: (string | number)[]): Promise<T | null> {
    const url = process.env.KV2_KV_REST_API_URL;
    const token = process.env.KV2_KV_REST_API_TOKEN;

    if (!url || !token) {
        const errorMsg = '@vercel/kv: Missing required environment variables KV2_KV_REST_API_URL or KV2_KV_REST_API_TOKEN.';
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    
    // Construct the command URL like: https://<url>/lpush/mykey/myvalue
    const commandUrl = [url, command, ...args.map(encodeURIComponent)].join('/');

    try {
        const response = await fetch(commandUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error(`Failed to execute command "${command}" via Vercel KV REST API. Status: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data.result as T;

    } catch (error) {
        console.error(`Error executing command via KV REST API for command "${command}":`, error);
        return null;
    }
}


/**
 * Bypasses the Vercel Data Cache by fetching directly from the KV REST API 
 * with a 'no-store' cache policy. This is used for simple GET operations on single keys.
 * @param key The key to read from Vercel KV.
 * @returns The parsed data or null if not found or an error occurs.
 */
async function readFromKv<T>(key: string): Promise<T | null> {
    const result = await executeKvCommand<string>('get', key);
    if (result) {
        try {
            return JSON.parse(result) as T;
        } catch(e) {
            console.error(`Failed to parse JSON for key ${key}`, result);
            return null;
        }
    }
    return null;
}

/**
 * Writes a value to a key in Vercel KV using the REST API (SET command).
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
    const stats = await readFromKv<Stats>(STATS_KEY);
    return stats ?? defaultStats;
}

export async function writeStats(stats: Stats): Promise<void> {
    await writeToKv(STATS_KEY, stats);
}


// --- SCALABLE IP Usage DB Functions ---

/**
 * Reads the usage data for a single, specific IP address.
 * @param ip The IP address to look up.
 * @returns The usage data for the IP, or null if not found.
 */
export async function readIpUsageForIp(ip: string): Promise<IpUsage | null> {
    return await readFromKv<IpUsage>(`${IP_KEY_PREFIX}${ip}`);
}

/**
 * Writes the usage data for a single, specific IP address.
 * @param ip The IP address to write data for.
 * @param usage The usage data to save.
 */
export async function writeIpUsageForIp(ip: string, usage: IpUsage): Promise<void> {
    await writeToKv(`${IP_KEY_PREFIX}${ip}`, usage);
}

/**
 * Deletes the usage data for a single, specific IP address.
 * @param ip The IP address to delete data for.
 */
export async function deleteIpUsageForIp(ip: string): Promise<void> {
    await executeKvCommand('del', `${IP_KEY_PREFIX}${ip}`);
}

// --- SCALABLE Gallery DB Functions ---

/**
 * Adds a new gallery entry to the beginning of the list in KV.
 * This is an efficient O(1) operation.
 * @param entry The gallery entry object to add.
 */
export async function addGalleryEntry(entry: GalleryEntry): Promise<void> {
    await executeKvCommand('lpush', GALLERY_KEY, JSON.stringify(entry));
}

/**
 * Gets the total number of entries in the gallery list.
 * This is an efficient O(1) operation.
 * @returns The total number of entries.
 */
export async function getGalleryCount(): Promise<number> {
    const count = await executeKvCommand<number>('llen', GALLERY_KEY);
    return count ?? 0;
}

/**
 * Reads a specific page of gallery entries from the list in KV.
 * This is an efficient O(M) operation where M is the page size, not the total list size.
 * @param page The page number to retrieve (1-based).
 * @param limit The number of entries per page.
 * @returns An array of gallery entries for the requested page.
 */
export async function readPaginatedGalleryEntries(page: number, limit: number): Promise<GalleryEntry[]> {
    const start = (page - 1) * limit;
    const stop = start + limit - 1;
    const results = await executeKvCommand<string[]>('lrange', GALLERY_KEY, start, stop);
    
    if (!results) {
        return [];
    }
    
    // The results from KV are JSON strings, so they need to be parsed.
    return results.map(item => JSON.parse(item));
}
