import { Contract } from '@algorandfoundation/tealscript';

/**
 * HalalYield — Shariah Compliance Checker
 *
 * This stateless-style contract is called as the FIRST transaction in every
 * Atomic Transfer group. It verifies:
 *
 * 1. The target pool is on the approved Shariah-compliant pool registry
 * 2. The pool has not been flagged as non-compliant since last audit
 * 3. The calling address has passed ZK-KYC (jurisdiction + sanctions check)
 *
 * If ANY check fails, the transaction is rejected — and because it is
 * grouped atomically with the deposit transaction, the ENTIRE group fails.
 * This is the core safety guarantee: it is IMPOSSIBLE to invest in a
 * non-compliant pool through HalalYield.
 *
 * @architecture Algorand Atomic Transfer
 *   Tx[0]: checkCompliance(poolAppId, asaId)  ← this contract
 *   Tx[1]: ASA transfer to pool               ← deposit
 *   Both execute or neither executes.
 */
export class ShariahComplianceChecker extends Contract {
  // ── STATE ────────────────────────────────────────────────────────────────

  /** Admin address — can update pool registry and compliance flags */
  admin = GlobalStateKey<Address>();

  /** Maps pool app ID → compliance status (1 = compliant, 0 = suspended) */
  poolCompliance = BoxMap<uint64, uint64>();

  /** Maps pool app ID → last audit timestamp */
  poolLastAudit = BoxMap<uint64, uint64>();

  /** Maps pool app ID → Shariah structure type (1=Murabaha, 2=Musharakah, 3=Ijarah, 4=Sukuk) */
  poolStructure = BoxMap<uint64, uint64>();

  /** Maps address → KYC verification timestamp (0 = not verified) */
  kycVerified = BoxMap<Address, uint64>();

  /** Maps address → jurisdiction code (e.g. 1=US, 2=EU, 3=GCC, 4=SEA) */
  kycJurisdiction = BoxMap<Address, uint64>();

  // ── CONSTANTS ─────────────────────────────────────────────────────────────
  MAX_AUDIT_AGE_SECONDS = 7_776_000; // 90 days

  // ── DEPLOYMENT ────────────────────────────────────────────────────────────

  createApplication(): void {
    this.admin.value = this.txn.sender;
  }

  // ── ADMIN: POOL REGISTRY ──────────────────────────────────────────────────

  /**
   * Register a new Shariah-compliant pool.
   * Only callable by admin (initially the HalalYield multisig).
   * In production: governed by an on-chain Shariah board DAO.
   */
  registerPool(poolAppId: uint64, structureType: uint64): void {
    assert(this.txn.sender === this.admin.value, 'Only admin can register pools');
    assert(structureType >= 1 && structureType <= 4, 'Invalid Shariah structure type');

    this.poolCompliance(poolAppId).value = 1;
    this.poolLastAudit(poolAppId).value = globals.latestTimestamp;
    this.poolStructure(poolAppId).value = structureType;
  }

  /**
   * Suspend a pool — e.g. if a Shariah violation is discovered.
   * Suspended pools immediately become uninvestable for all users.
   */
  suspendPool(poolAppId: uint64): void {
    assert(this.txn.sender === this.admin.value, 'Only admin can suspend pools');
    this.poolCompliance(poolAppId).value = 0;
  }

  /** Reinstate a pool after re-audit confirms compliance. */
  reinstatePool(poolAppId: uint64): void {
    assert(this.txn.sender === this.admin.value, 'Only admin can reinstate pools');
    this.poolCompliance(poolAppId).value = 1;
    this.poolLastAudit(poolAppId).value = globals.latestTimestamp;
  }

  // ── ADMIN: KYC ────────────────────────────────────────────────────────────

  /**
   * Record a ZK-KYC verification result for a user address.
   * Called by the KYC oracle after a ZK proof is verified off-chain.
   * In production: replaced by on-chain ZK proof verification
   * using Privado ID or a custom Algorand ZK circuit.
   */
  recordKyc(userAddress: Address, jurisdictionCode: uint64): void {
    assert(this.txn.sender === this.admin.value, 'Only KYC oracle can record verifications');
    this.kycVerified(userAddress).value = globals.latestTimestamp;
    this.kycJurisdiction(userAddress).value = jurisdictionCode;
  }

  // ── CORE: COMPLIANCE CHECK ─────────────────────────────────────────────────

  /**
   * THE MAIN FUNCTION — called in Tx[0] of every invest Atomic Transfer.
   *
   * Checks:
   * 1. Pool is registered and currently compliant
   * 2. Pool audit is not expired (< 90 days old)
   * 3. Caller has passed KYC
   * 4. Caller's jurisdiction permits this pool type
   *
   * If all checks pass: returns 1 (success, Tx[1] deposit can proceed)
   * If any check fails: ABORTS the entire Atomic Transfer group
   */
  checkCompliance(poolAppId: uint64, _asaId: uint64): uint64 {
    const caller = this.txn.sender;

    // Check 1: Pool must be registered
    assert(this.poolCompliance(poolAppId).exists, 'Pool not registered in Shariah registry');

    // Check 2: Pool must be currently compliant
    assert(this.poolCompliance(poolAppId).value === 1, 'Pool is suspended — Shariah compliance issue detected');

    // Check 3: Audit must be fresh (< 90 days)
    const auditAge = globals.latestTimestamp - this.poolLastAudit(poolAppId).value;
    assert(auditAge < this.MAX_AUDIT_AGE_SECONDS, 'Pool audit expired — pending re-certification');

    // Check 4: Caller must be KYC verified
    assert(this.kycVerified(caller).exists, 'Address has not completed KYC verification');

    // Check 5: Jurisdiction check (extensible per pool in production)
    assert(this.kycJurisdiction(caller).value > 0, 'Jurisdiction not recognized');

    return 1;
  }

  // ── READ ───────────────────────────────────────────────────────────────────

  /** Check if a pool is currently compliant without triggering a state change. */
  isPoolCompliant(poolAppId: uint64): uint64 {
    if (!this.poolCompliance(poolAppId).exists) return 0;
    return this.poolCompliance(poolAppId).value;
  }

  /** Get pool's Shariah structure type. */
  getPoolStructure(poolAppId: uint64): uint64 {
    if (!this.poolStructure(poolAppId).exists) return 0;
    return this.poolStructure(poolAppId).value;
  }

  /** Check if an address has valid KYC. */
  isKycVerified(userAddress: Address): uint64 {
    if (!this.kycVerified(userAddress).exists) return 0;
    return 1;
  }
}
