module deployer_address::mock_usdc_fa {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option;
    use supra_framework::object::{Self, Object};
    use supra_framework::fungible_asset::{
        Self,
        MintRef,
        BurnRef,
        TransferRef,
        Metadata,
        FungibleAsset
    };
    use supra_framework::primary_fungible_store;

    //==============================================================================================
    // Error Codes
    //==============================================================================================

    const ENOT_ADMIN: u64 = 1;
    const EMAX_SUPPLY_EXCEEDED: u64 = 3;
    const EINSUFFICIENT_BALANCE: u64 = 5;
    const ENOT_WHITELISTED: u64 = 7;

    //==============================================================================================
    // Constants
    //==============================================================================================

    // Token symbol - used to create the metadata object
    const SEED: vector<u8> = b"Mock_usdc_fa";

    // Max supply: 1 billion tokens with 8 decimals
    const MAX_SUPPLY: u128 = 100000000000000000;

    // Token decimals
    const DECIMALS: u8 = 8;

    //==============================================================================================
    // Structs
    //==============================================================================================

    /// Store all the permission Refs on the metadata object
    #[resource_group_member(group = supra_framework::object::ObjectGroup)]
    struct ManagingRefs has key {
        mint_ref: MintRef,
        burn_ref: BurnRef,
        transfer_ref: TransferRef,
        // Track total minted to enforce max supply
        total_minted: u128
    }

    /// Whitelist for addresses authorized to mint tokens
    struct MintWhitelist has key {
        whitelisted_minters: vector<address>
    }

    //==============================================================================================
    // Initialize Module
    //==============================================================================================

    /// Initialize the fungible asset when module is published
    fun init_module(admin: &signer) {
        // Step 1: Create the metadata object (this will hold all token info)
        let metadata_constructor_ref = &object::create_named_object(admin, SEED);

        // Step 2: Create the fungible asset with max supply!
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            metadata_constructor_ref,
            option::some(MAX_SUPPLY), 
            string::utf8(b"MU"),
            string::utf8(b"MU"),
            DECIMALS,
            string::utf8(
                b"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPB2KvswVpq4lWjDSEegrnFn7KBB661qoV7w&s"
            ),
            string::utf8(b"https://doge.ai")
        );

        // Step 3: Generate all the permission Refs
        let mint_ref = fungible_asset::generate_mint_ref(metadata_constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(metadata_constructor_ref);
        let transfer_ref =
            fungible_asset::generate_transfer_ref(metadata_constructor_ref);

        // Step 4: Store the Refs ON the metadata object (recommended pattern!)
        let metadata_object_signer = &object::generate_signer(metadata_constructor_ref);
        move_to(
            metadata_object_signer,
            ManagingRefs { mint_ref, burn_ref, transfer_ref, total_minted: 0 }
        );

        // Step 5: Initialize the whitelist on admin's account
        move_to(
            admin,
            MintWhitelist { whitelisted_minters: vector::empty() }
        );
    }

    //==============================================================================================
    // Minting Functions
    //==============================================================================================

    /// Mint tokens to a specific address
    /// Only admin or whitelisted addresses can mint
    public entry fun mint(
        minter: &signer, recipient: address, amount: u64
    ) acquires ManagingRefs, MintWhitelist {
        let minter_addr = signer::address_of(minter);

        // Check authorization
        let is_admin = minter_addr == @deployer_address;
        let is_whitelisted = is_address_whitelisted(minter_addr);
        assert!(is_admin || is_whitelisted, ENOT_WHITELISTED);

        // Get the refs from the metadata object
        let metadata_addr = get_metadata_address();
        let managing_refs = borrow_global_mut<ManagingRefs>(metadata_addr);

        // Check max supply
        let new_total = managing_refs.total_minted + (amount as u128);
        assert!(new_total <= MAX_SUPPLY, EMAX_SUPPLY_EXCEEDED);

        // Mint using FA function (different from Coin!)
        let mint_ref = &managing_refs.mint_ref;
        primary_fungible_store::mint(mint_ref, recipient, amount);

        // Update total minted
        managing_refs.total_minted = new_total;
    }

    //==============================================================================================
    // Whitelist Management
    //==============================================================================================

    /// Add an address to the mint whitelist
    public entry fun add_to_whitelist(
        admin: &signer, address_to_add: address
    ) acquires MintWhitelist {
        assert!(signer::address_of(admin) == @deployer_address, ENOT_ADMIN);

        let whitelist = borrow_global_mut<MintWhitelist>(@deployer_address);
        if (!vector::contains(&whitelist.whitelisted_minters, &address_to_add)) {
            vector::push_back(&mut whitelist.whitelisted_minters, address_to_add);
        };
    }

    /// Remove an address from the whitelist
    public entry fun remove_from_whitelist(
        admin: &signer, address_to_remove: address
    ) acquires MintWhitelist {
        assert!(signer::address_of(admin) == @deployer_address, ENOT_ADMIN);

        let whitelist = borrow_global_mut<MintWhitelist>(@deployer_address);
        let (found, index) = vector::index_of(
            &whitelist.whitelisted_minters,
            &address_to_remove
        );

        if (found) {
            vector::remove(&mut whitelist.whitelisted_minters, index);
        };
    }

    /// Check if address is whitelisted
    fun is_address_whitelisted(addr: address): bool acquires MintWhitelist {
        let whitelist = borrow_global<MintWhitelist>(@deployer_address);
        vector::contains(&whitelist.whitelisted_minters, &addr)
    }

    //==============================================================================================
    // Transfer Functions
    //==============================================================================================

    /// Transfer tokens - uses FA's primary_fungible_store!
    public entry fun transfer(from: &signer, to: address, amount: u64) {
        let metadata = get_metadata();
        primary_fungible_store::transfer(from, metadata, to, amount);
    }

    //==============================================================================================
    // Burning Functions
    //==============================================================================================

    /// Admin burns tokens from an account
    public entry fun admin_burn(
        admin: &signer, account: address, amount: u64
    ) acquires ManagingRefs {
        assert!(signer::address_of(admin) == @deployer_address, ENOT_ADMIN);

        let metadata_addr = get_metadata_address();
        let managing_refs = borrow_global<ManagingRefs>(metadata_addr);

        // Use primary_fungible_store burn function
        primary_fungible_store::burn(&managing_refs.burn_ref, account, amount);
    }

    //==============================================================================================
    // Freezing Functions (NEW - works everywhere!)
    //==============================================================================================

    /// Freeze an account - they can't send or receive tokens!
    public entry fun freeze_account(admin: &signer, account: address) acquires ManagingRefs {
        assert!(signer::address_of(admin) == @deployer_address, ENOT_ADMIN);

        let metadata_addr = get_metadata_address();
        let managing_refs = borrow_global<ManagingRefs>(metadata_addr);

        // Set frozen flag to true
        primary_fungible_store::set_frozen_flag(
            &managing_refs.transfer_ref, account, true
        );
    }

    /// Unfreeze an account
    public entry fun unfreeze_account(admin: &signer, account: address) acquires ManagingRefs {
        assert!(signer::address_of(admin) == @deployer_address, ENOT_ADMIN);

        let metadata_addr = get_metadata_address();
        let managing_refs = borrow_global<ManagingRefs>(metadata_addr);

        // Set frozen flag to false
        primary_fungible_store::set_frozen_flag(
            &managing_refs.transfer_ref, account, false
        );
    }

    //==============================================================================================
    // Helper Functions
    //==============================================================================================

    /// Get the metadata object address
    /// This is computed from admin address + DOG_SYMBOL
    fun get_metadata_address(): address {
        object::create_object_address(&@deployer_address, SEED)
    }

    /// Get the metadata object reference
    fun get_metadata(): Object<Metadata> {
        object::address_to_object<Metadata>(get_metadata_address())
    }

    //==============================================================================================
    // View Functions
    //==============================================================================================

    /// Get balance of an address
    #[view]
    public fun balance_of(account: address): u64 {
        let metadata = get_metadata();
        primary_fungible_store::balance(account, metadata)
    }

    /// Get max supply
    #[view]
    public fun max_supply(): u128 {
        MAX_SUPPLY
    }

    /// Get total minted so far
    #[view]
    public fun total_minted(): u128 acquires ManagingRefs {
        let metadata_addr = get_metadata_address();
        borrow_global<ManagingRefs>(metadata_addr).total_minted
    }

    /// Get remaining mintable amount
    #[view]
    public fun remaining_supply(): u128 acquires ManagingRefs {
        MAX_SUPPLY - total_minted()
    }

    /// Get token name
    #[view]
    public fun name(): String {
        let metadata = get_metadata();
        fungible_asset::name(metadata)
    }

    /// Get token symbol
    #[view]
    public fun symbol(): String {
        let metadata = get_metadata();
        fungible_asset::symbol(metadata)
    }

    /// Get decimals
    #[view]
    public fun decimals(): u8 {
        let metadata = get_metadata();
        fungible_asset::decimals(metadata)
    }

    /// Check if account is frozen
    #[view]
    public fun is_frozen(account: address): bool {
        let metadata = get_metadata();
        primary_fungible_store::is_frozen(account, metadata)
    }

    /// Check if address is whitelisted
    #[view]
    public fun is_whitelisted(addr: address): bool acquires MintWhitelist {
        is_address_whitelisted(addr)
    }

    /// Get metadata address (useful for SDK integration!)
    #[view]
    public fun metadata_address(): address {
        get_metadata_address()
    }
}

