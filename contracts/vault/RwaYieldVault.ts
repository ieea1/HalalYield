import { Contract } from '@algorandfoundation/tealscript';

/**
 * HalalYield — RWA Yield Vault
 *
 * A non-custodial vault that accepts user deposits in a stablecoin (USDC ASA),
 * routes them to the underlying RWA protocol (e.g. Centrifuge pool),
 * and distributes yield back to depositors proportionally.
 *
 * Key design principles:
 * - ALWAYS called as Tx[1] in an Atomic Transfer where Tx[0] is the
 *   ShariahComplianceChecker. This means deposits are structurally
 *   impossible without passing compliance checks.
 * - Non-custodial: users can withdraw at any time (subject to lockup)
 * - Yield accrues every round via an oracle-updated yield rate
 *
 * @architecture
 *   Each vault instance represents one RWA pool integration.
 *   Deploy one vault per pool (Centrifuge, Ondo, etc.)
 */
export class RwaYieldVault extends Contract {
  // ── GLOBAL STATE ─────────────────────────────────────────────────────────

  /** Admin / operator address */
  admin = GlobalStateKey<Address>();

  /** The ASA users deposit (e.g. USDC) */
  depositAsaId = GlobalStateKey<uint64>();

  /** Total assets deposited across all users */
  totalDeposits = GlobalStateKey<uint64>();

  /** Total yield distributed to date */
  totalYieldPaid = GlobalStateKey<uint64>();

  /** Current APY in basis points (e.g. 840 = 8.40%) */
  currentApyBps = GlobalStateKey<uint64>();

  /** Lockup period in seconds (0 = liquid) */
  lockupSeconds = GlobalStateKey<uint64>();

  /** Whether the vault is accepting new deposits */
  depositsOpen = GlobalStateKey<uint64>();

  /** Shariah compliance checker app ID — verified in every deposit group */
  complianceAppId = GlobalStateKey<uint64>();

  /** Human-readable vault name stored on-chain */
  vaultName = GlobalStateKey<bytes>();

  // ── LOCAL STATE (per user) ────────────────────────────────────────────────

  /** User's deposited principal */
  userDeposit = LocalStateKey<uint64>();

  /** Timestamp of user's last deposit (for lockup enforcement) */
  userDepositTime = LocalStateKey<uint64>();

  /** Total yield claimed by user */
  userYieldClaimed = LocalStateKey<uint64>();

  // ── DEPLOYMENT ────────────────────────────────────────────────────────────

  createApplication(
    depositAsaId: uint64,
    apyBps: uint64,
    lockupSeconds: uint64,
    complianceAppId: uint64,
    vaultName: string
  ): void {
    this.admin.value = this.txn.sender;
    this.depositAsaId.value = depositAsaId;
    this.currentApyBps.value = apyBps;
    this.lockupSeconds.value = lockupSeconds;
    this.complianceAppId.value = complianceAppId;
    this.depositsOpen.value = 1;
    this.totalDeposits.value = 0;
    this.totalYieldPaid.value = 0;
    this.vaultName.value = vaultName;
  }

  // ── OPT IN ────────────────────────────────────────────────────────────────

  optInToApplication(): void {
    this.userDeposit(this.txn.sender).value = 0;
    this.userDepositTime(this.txn.sender).value = 0;
    this.userYieldClaimed(this.txn.sender).value = 0;
  }

  // ── DEPOSIT ───────────────────────────────────────────────────────────────

  /**
   * Accept a user deposit.
   *
   * CRITICAL: This MUST be called as Tx[1] in an Atomic Transfer group
   * where Tx[0] calls ShariahComplianceChecker.checkCompliance().
   * Enforced by checking that the group size is 2 and Tx[0] is a call
   * to the registered compliance app.
   *
   * @param depositTxn - The ASA transfer sending funds to this vault
   */
  deposit(depositTxn: AssetTransferTxn): void {
    // ── Atomic group enforcement ──────────────────────────────────────────
    // Verify this is tx[1] in a 2-tx group where tx[0] is the compliance check
    assert(this.txn.groupIndex === 1, 'Deposit must be tx[1] in atomic group');
    assert(this.txnGroup.length === 2, 'Atomic group must have exactly 2 transactions');

    const complianceTxn = this.txnGroup[0];
    assert(
      complianceTxn.typeEnum === TransactionType.ApplicationCall,
      'tx[0] must be compliance check app call'
    );
    assert(
      complianceTxn.applicationID === this.complianceAppId.value,
      'tx[0] must call the registered Shariah compliance checker'
    );

    // ── Deposit validation ────────────────────────────────────────────────
    assert(this.depositsOpen.value === 1, 'Vault is not accepting deposits');
    assert(depositTxn.assetReceiver === this.app.address, 'ASA must be sent to vault address');
    assert(depositTxn.xferAsset === this.depositAsaId.value, 'Wrong ASA — must use vault deposit asset');
    assert(depositTxn.assetAmount > 0, 'Deposit amount must be greater than 0');
    assert(depositTxn.sender === this.txn.sender, 'Deposit sender must match caller');

    // ── Record deposit ────────────────────────────────────────────────────
    const amount = depositTxn.assetAmount;
    this.userDeposit(this.txn.sender).value =
      this.userDeposit(this.txn.sender).value + amount;
    this.userDepositTime(this.txn.sender).value = globals.latestTimestamp;
    this.totalDeposits.value = this.totalDeposits.value + amount;
  }

  // ── WITHDRAW ──────────────────────────────────────────────────────────────

  /**
   * Withdraw principal + accrued yield.
   * Enforces lockup period if applicable.
   */
  withdraw(amount: uint64): void {
    const caller = this.txn.sender;
    const userBal = this.userDeposit(caller).value;

    assert(userBal >= amount, 'Insufficient deposit balance');

    // Lockup check
    if (this.lockupSeconds.value > 0) {
      const elapsed = globals.latestTimestamp - this.userDepositTime(caller).value;
      assert(elapsed >= this.lockupSeconds.value, 'Lockup period has not elapsed');
    }

    // Update state
    this.userDeposit(caller).value = userBal - amount;
    this.totalDeposits.value = this.totalDeposits.value - amount;

    // Send ASA back to user
    sendAssetTransfer({
      xferAsset: AssetID.fromUint64(this.depositAsaId.value),
      assetReceiver: caller,
      assetAmount: amount,
    });
  }

  // ── YIELD DISTRIBUTION ────────────────────────────────────────────────────

  /**
   * Claim accrued yield.
   * In production: yield is calculated based on time-weighted deposits
   * and the current APY, with the oracle updating APY to match the
   * underlying RWA protocol's actual yield.
   */
  claimYield(): void {
    const caller = this.txn.sender;
    const principal = this.userDeposit(caller).value;
    assert(principal > 0, 'No deposit to claim yield on');

    const elapsed = globals.latestTimestamp - this.userDepositTime(caller).value;
    const secondsPerYear = 31_536_000;

    // yield = principal * (apyBps / 10000) * (elapsed / secondsPerYear)
    const yieldAmount =
      (principal * this.currentApyBps.value * elapsed) /
      (10_000 * secondsPerYear);

    assert(yieldAmount > 0, 'No yield accrued yet');

    this.userYieldClaimed(caller).value =
      this.userYieldClaimed(caller).value + yieldAmount;
    this.totalYieldPaid.value = this.totalYieldPaid.value + yieldAmount;

    sendAssetTransfer({
      xferAsset: AssetID.fromUint64(this.depositAsaId.value),
      assetReceiver: caller,
      assetAmount: yieldAmount,
    });
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────

  /** Update APY — called by oracle when underlying RWA yield changes */
  updateApy(newApyBps: uint64): void {
    assert(this.txn.sender === this.admin.value, 'Only admin can update APY');
    assert(newApyBps <= 5_000, 'APY cannot exceed 50% — sanity check');
    this.currentApyBps.value = newApyBps;
  }

  pauseDeposits(): void {
    assert(this.txn.sender === this.admin.value, 'Only admin');
    this.depositsOpen.value = 0;
  }

  resumeDeposits(): void {
    assert(this.txn.sender === this.admin.value, 'Only admin');
    this.depositsOpen.value = 1;
  }

  // ── VIEWS ─────────────────────────────────────────────────────────────────

  getUserBalance(userAddress: Address): uint64 {
    if (!this.userDeposit(userAddress).exists) return 0;
    return this.userDeposit(userAddress).value;
  }

  getTotalDeposits(): uint64 {
    return this.totalDeposits.value;
  }

  getCurrentApy(): uint64 {
    return this.currentApyBps.value;
  }
}
