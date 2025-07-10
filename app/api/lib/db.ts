
import { promises as fs } from 'fs';
import path from 'path';

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


// --- File Paths ---
const statsDbPath = path.join('/tmp', 'db.json');
const ipUsageDbPath = path.join('/tmp', 'ip_usage.json');


// --- Stats DB Functions ---
const defaultStats: Stats = { og_bonkgang: 0, hung_hing: 0, street_gang: 0 };

export async function readStats(): Promise<Stats> {
    try {
        await fs.access(statsDbPath);
        const data = await fs.readFile(statsDbPath, 'utf8');
        // Ensure the parsed data is not null and is an object
        const parsedData = JSON.parse(data);
        if (parsedData && typeof parsedData === 'object') {
            return parsedData;
        }
        // Fallback if file content is invalid
        await writeStats(defaultStats);
        return defaultStats;
    } catch (error) {
        // This handles file not existing or other read errors
        await writeStats(defaultStats);
        return defaultStats;
    }
}

export async function writeStats(stats: Stats): Promise<void> {
    await fs.writeFile(statsDbPath, JSON.stringify(stats, null, 2), 'utf8');
}


// --- IP Usage DB Functions ---
const defaultIpUsageData: IpUsageData = {};

export async function readIpUsage(): Promise<IpUsageData> {
    try {
        await fs.access(ipUsageDbPath);
        const data = await fs.readFile(ipUsageDbPath, 'utf8');
        const parsedData = JSON.parse(data);
        if (parsedData && typeof parsedData === 'object') {
            return parsedData;
        }
        await writeIpUsage(defaultIpUsageData);
        return defaultIpUsageData;
    } catch (error) {
        await writeIpUsage(defaultIpUsageData);
        return defaultIpUsageData;
    }
}

export async function writeIpUsage(data: IpUsageData): Promise<void> {
    await fs.writeFile(ipUsageDbPath, JSON.stringify(data, null, 2), 'utf8');
}
