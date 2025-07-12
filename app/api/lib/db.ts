import { kv } from '@vercel/kv';

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


// --- Stats DB Functions ---
const defaultStats: Stats = { og_bonkgang: 0, hung_hing: 0, street_gang: 0 };

export async function readStats(): Promise<Stats> {
    const stats = await kv.get<Stats>(STATS_KEY);
    // If stats don't exist in KV, return the default structure.
    return stats ?? defaultStats;
}

export async function writeStats(stats: Stats): Promise<void> {
    await kv.set(STATS_KEY, stats);
}


// --- IP Usage DB Functions ---
const defaultIpUsageData: IpUsageData = {};

export async function readIpUsage(): Promise<IpUsageData> {
    const data = await kv.get<IpUsageData>(IP_USAGE_KEY);
    // If IP usage data doesn't exist, return an empty object.
    return data ?? defaultIpUsageData;
}

export async function writeIpUsage(data: IpUsageData): Promise<void> {
    await kv.set(IP_USAGE_KEY, data);
}