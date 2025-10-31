import * as fcl from "@onflow/fcl";

export const initializeFlowTestnet = () => {
    const config: Record<string, unknown> = {
        "accessNode.api": "https://rest-testnet.onflow.org",
        "flow.network": "testnet",
        "app.detail.title": "Seflow",
        "app.detail.icon": "https://seflow.vercel.app/logo.png",
        "app.detail.description": "Web3 Salary Management and DeFi Investment Made Simple",
        "app.detail.url": "https://seflow.vercel.app",

        // Direct service configuration for Blocto (bypasses discovery CORS issues)
        "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
        "0x9d2e44203cb13051": {
            f_type: "Service",
            f_vsn: "1.0.0",
            type: "authn",
            method: "IFRAME/RPC",
            endpoint: "https://wallet.blocto.app/api/flow/authn",
            uid: "blocto",
            id: "0x9d2e44203cb13051#blocto",
        },

        // Additional configuration for better error handling
        "fcl.limit": 1000,
        "fcl.txPollRate": 1000,
        "fcl.eventPollRate": 1000,
        "fcl.eventPollRateMultiplier": 1.5,
        "fcl.maxEventPollRate": 5000,
        "fcl.warn": false,

        // Disable WalletConnect warnings if no valid project ID
        "fcl.walletConnect.enabled": false,

        // Standard contracts on testnet
        "0xNonFungibleToken": "0x631e88ae7f1d7c20",
        "0xFungibleToken": "0x9a0766d93b6608b7",
        "0xFlowToken": "0x7e60df042a9c0868",
        "0xViewResolver": "0x631e88ae7f1d7c20",
        "0xMetadataViews": "0x631e88ae7f1d7c20",
        "0xFungibleTokenMetadataViews": "0x9a0766d93b6608b7",
        "0xBurner": "0x9a0766d93b6608b7",

        // 🚀 Seflow deployed contracts on testnet
        "0xFrothToken": "0x7d7f281847222367",
        "0xSavingsVault": "0x7d7f281847222367",
        "0xLiquidityPool": "0x7d7f281847222367",
        "0xSeflow": "0x7d7f281847222367",
    };

    fcl.config(config);
};
