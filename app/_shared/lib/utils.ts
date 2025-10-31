import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format wallet address for better UX display
 * Example: 0x76551a818ba75d4e -> 0x7655...5d4e
 */
export function formatWalletAddress(address: string | null | undefined): string {
    if (!address) return "";
    if (address.length <= 10) return address; // Don't format short addresses
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

