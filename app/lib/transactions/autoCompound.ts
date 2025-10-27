// Simple setup transaction that creates basic auto-compound settings
export const SETUP_AND_SCHEDULE_AUTO_COMPOUND = `
import FlowToken from 0x7e60df042a9c0868

transaction(intervalDays: UInt64) {
    
    prepare(account: auth(BorrowValue, SaveValue, IssueStorageCapabilityController, PublishCapability) &Account) {
        
        // Simple auto-compound setup using basic types instead of resources
        let storagePath = StoragePath(identifier: "SeflowAutoCompound")!
        let publicPath = PublicPath(identifier: "SeflowAutoCompound")!
        
        // Create settings as a struct instead of resource
        if !account.storage.check<{String: AnyStruct}>(from: storagePath) {
            let settings: {String: AnyStruct} = {
                "intervalDays": intervalDays,
                "accountAddress": account.address.toString(),
                "isEnabled": true,
                "createdAt": getCurrentBlock().timestamp
            }
            
            account.storage.save(settings, to: storagePath)
            
            // Create public capability
            let publicCap = account.capabilities.storage.issue<&{String: AnyStruct}>(storagePath)
            account.capabilities.publish(publicCap, at: publicPath)
            
            log("Auto-compound settings created for interval: ".concat(intervalDays.toString()).concat(" days"))
        } else {
            log("Auto-compound settings already exist")
        }
        
        // Verify minimum balance for operations
        let vault = account.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow FlowToken vault")
        
        let minimumBalance: UFix64 = 0.01
        if vault.balance < minimumBalance {
            panic("Insufficient funds. Need at least ".concat(minimumBalance.toString()).concat(" FLOW"))
        }
        
        log("Auto-compound setup completed!")
        log("Account balance: ".concat(vault.balance.toString()).concat(" FLOW"))
    }
}
`;

// Setup-only transaction without scheduling
export const SETUP_AUTO_COMPOUND_HANDLER = `
import FlowToken from 0x7e60df042a9c0868

transaction(intervalDays: UInt64) {
    
    prepare(account: auth(BorrowValue, SaveValue, IssueStorageCapabilityController, PublishCapability) &Account) {
        
        let storagePath = StoragePath(identifier: "SeflowAutoCompound")!
        let publicPath = PublicPath(identifier: "SeflowAutoCompound")!
        
        // Only create if it doesn't exist
        if !account.storage.check<{String: AnyStruct}>(from: storagePath) {
            let settings: {String: AnyStruct} = {
                "intervalDays": intervalDays,
                "accountAddress": account.address.toString(),
                "isEnabled": false,  // Start disabled for setup-only
                "createdAt": getCurrentBlock().timestamp
            }
            
            account.storage.save(settings, to: storagePath)
            
            let publicCap = account.capabilities.storage.issue<&{String: AnyStruct}>(storagePath)
            account.capabilities.publish(publicCap, at: publicPath)
            
            log("Auto-compound handler setup completed for ".concat(account.address.toString()))
        } else {
            log("Auto-compound handler already exists")
        }
    }
}
`;

export const SCHEDULE_AUTO_COMPOUND = `
import FlowToken from 0x7e60df042a9c0868

transaction(intervalDays: UInt64) {
    
    prepare(account: auth(BorrowValue, SaveValue) &Account) {
        
        let storagePath = StoragePath(identifier: "SeflowAutoCompound")!
        
        // Check if auto-compound settings exist and enable them
        if let settings = account.storage.borrow<&{String: AnyStruct}>(from: storagePath) {
            // Update the isEnabled field
            settings["isEnabled"] = true
            settings["lastUpdated"] = getCurrentBlock().timestamp
            
            let currentTime = getCurrentBlock().timestamp
            let nextExecutionTime = currentTime + UFix64(intervalDays * 24 * 3600)
            
            log("Auto-compound enabled!")
            log("Next execution would be: ".concat(nextExecutionTime.toString()))
            
            if let intervalValue = settings["intervalDays"] as? UInt64 {
                log("Current interval: ".concat(intervalValue.toString()).concat(" days"))
            }
            
        } else {
            panic("Auto-compound settings not found. Please run setup first.")
        }
        
        // Verify sufficient balance
        let vault = account.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow FlowToken vault")
        
        let minimumBalance: UFix64 = 0.01
        if vault.balance < minimumBalance {
            panic("Insufficient funds. Need at least ".concat(minimumBalance.toString()).concat(" FLOW"))
        }
        
        log("Balance check passed: ".concat(vault.balance.toString()).concat(" FLOW"))
    }
}
`;

export const CHECK_AUTO_COMPOUND_STATUS = `
access(all) fun main(address: Address): {String: AnyStruct} {
    let account = getAccount(address)
    let result: {String: AnyStruct} = {}
    
    // Check if auto-compound handler exists using storage path directly
    let handlerStoragePath = StoragePath(identifier: "AutoCompoundHandler")!
    let handlerExists = account.storage.check<@AnyResource>(from: handlerStoragePath)
    result["handlerExists"] = handlerExists
    
    // Check if transaction scheduler manager exists
    let managerStoragePath = StoragePath(identifier: "FlowTransactionSchedulerManager")!
    let managerExists = account.storage.check<@AnyResource>(from: managerStoragePath)
    result["managerExists"] = managerExists
    
    // Check if handler capability exists using public path
    let handlerPublicPath = PublicPath(identifier: "AutoCompoundHandler")!
    let handlerCapExists = account.capabilities.get<&AnyResource>(handlerPublicPath).check()
    result["handlerCapabilityExists"] = handlerCapExists
    
    // Add basic account info
    result["address"] = address.toString()
    result["balance"] = account.balance.toString()
    
    return result
}
`;

export const GET_SCHEDULED_TRANSACTIONS = `
access(all) fun main(address: Address): {String: AnyStruct} {
    let account = getAccount(address)
    let result: {String: AnyStruct} = {}
    
    // Basic info about the account
    result["address"] = address.toString()
    result["balance"] = account.balance.toString()
    
    // Check for any storage items that might be transaction-related
    let managerPath = StoragePath(identifier: "FlowTransactionSchedulerManager")
    if managerPath != nil {
        let hasManager = account.storage.check<@AnyResource>(from: managerPath!)
        result["hasTransactionManager"] = hasManager
    } else {
        result["hasTransactionManager"] = false
    }
    
    // Note: Getting actual scheduled transactions would require access to the scheduler contract
    // which may not be publicly readable
    result["note"] = "Scheduled transactions require contract-specific queries"
    
    return result
}
`;