"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Trash2,
  X,
  RotateCcw,
  HandCoins
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { syncManager } from "@/lib/sync/syncManager";
import { useAuth } from "@/lib/contexts/AuthContext";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  reason: string;
  category: string;
  date: string;
}

interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  repeatInterval: "Monthly" | "One-time";
}

interface Debt {
  id: string;
  personName: string;
  amount: number;
  type: "owe" | "receivable";
  reason: string;
  dueDate?: string;
  isSettled?: boolean;
}

type ModalType = "credit" | "debit" | "bill" | "debt";

export default function FinancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"history" | "bills" | "debts">("history");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("credit");
  
  // Form States
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [personName, setPersonName] = useState("");
  const [debtType, setDebtType] = useState<"owe" | "receivable">("owe");
  const [repeatInterval, setRepeatInterval] = useState<"Monthly" | "One-time">("Monthly");

  // Load Data
  useEffect(() => {
    const savedTx = localStorage.getItem("monk_os_finance");
    const savedBills = localStorage.getItem("monk_os_bills");
    const savedDebts = localStorage.getItem("monk_os_debts");
    
    setTransactions(savedTx ? JSON.parse(savedTx) : []);
    setBills(savedBills ? JSON.parse(savedBills) : []);
    setDebts(savedDebts ? JSON.parse(savedDebts) : []);
  }, []);

  const saveTransactions = (data: Transaction[]) => {
    setTransactions(data);
    localStorage.setItem("monk_os_finance", JSON.stringify(data));
    window.dispatchEvent(new Event("finance_updated"));
  };

  const saveBills = (data: Bill[]) => {
    setBills(data);
    localStorage.setItem("monk_os_bills", JSON.stringify(data));
  };

  const saveDebts = (data: Debt[]) => {
    setDebts(data);
    localStorage.setItem("monk_os_debts", JSON.stringify(data));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;

    const id = crypto.randomUUID();
    const parsedAmount = Math.abs(parseFloat(amount));

    if (modalType === "credit" || modalType === "debit") {
      const newTx: Transaction = {
        id,
        type: modalType,
        amount: parsedAmount,
        reason: reason || (modalType === "credit" ? "Income" : "Expense"),
        category: "General",
        date: new Date().toISOString().split('T')[0],
      };
      saveTransactions([newTx, ...transactions]);
      if (user) {
        syncManager.save('finances', 'INSERT', {
          id: newTx.id,
          user_id: user.id,
          type: newTx.type,
          amount: newTx.amount,
          reason: newTx.reason,
          category: newTx.category,
          created_at: newTx.date
        });
      }
      setActiveTab("history");
    } else if (modalType === "bill") {
      const newBill: Bill = {
        id,
        title: reason || "Untitled Bill",
        amount: parsedAmount,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        isPaid: false,
        repeatInterval,
      };
      saveBills([newBill, ...bills]);
      if (user) {
        syncManager.save('bills', 'INSERT', {
          id: newBill.id,
          user_id: user.id,
          title: newBill.title,
          amount: newBill.amount,
          due_date: newBill.dueDate,
          is_paid: newBill.isPaid,
          repeat_interval: newBill.repeatInterval
        });
      }
      setActiveTab("bills");
    } else if (modalType === "debt") {
      const newDebt: Debt = {
        id,
        personName: personName || "Someone",
        amount: parsedAmount,
        type: debtType,
        reason: reason || "General Debt",
        dueDate: dueDate || undefined,
        isSettled: false
      };
      saveDebts([newDebt, ...debts]);
      if (user) {
        syncManager.save('debts', 'INSERT', {
          id: newDebt.id,
          user_id: user.id,
          person_name: newDebt.personName,
          amount: newDebt.amount,
          type: newDebt.type,
          reason: newDebt.reason,
          due_date: newDebt.dueDate
        });
      }
      setActiveTab("debts");
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setAmount(""); setReason(""); setDueDate(""); setPersonName(""); setDebtType("owe"); setRepeatInterval("Monthly");
  };

  // --- CALCULATIONS ---
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  // 1. Total Balance (All time)
  const totalBalance = transactions.reduce((acc, curr) => curr.type === "credit" ? acc + curr.amount : acc - curr.amount, 0);
  
  // 2. Monthly Income (Credits in current month)
  const monthlyIncome = transactions
    .filter(t => t.type === "credit" && t.date.startsWith(currentMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Monthly Spent (Debits in current month)
  const monthlySpent = transactions
    .filter(t => t.type === "debit" && t.date.startsWith(currentMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  // 4. Liabilities
  const totalOwed = debts.filter(d => d.type === "owe" && !d.isSettled).reduce((acc, curr) => acc + curr.amount, 0);
  const totalReceivable = debts.filter(d => d.type === "receivable" && !d.isSettled).reduce((acc, curr) => acc + curr.amount, 0);

  // Integrity Score
  const billIntegrity = bills.length > 0 ? (bills.filter(b => b.isPaid).length / bills.length) * 100 : 100;
  const logIntegrity = transactions.length > 0 ? Math.min((transactions.length / 5) * 100, 100) : 0;
  const integrityScore = Math.round((billIntegrity + logIntegrity) / 2);

  const clearLedger = () => {
    if (confirm("Reset ledger data?")) {
      localStorage.removeItem("monk_os_finance"); localStorage.removeItem("monk_os_bills"); localStorage.removeItem("monk_os_debts");
      setTransactions([]); setBills([]); setDebts([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 md:space-y-16 animate-in fade-in duration-700 pb-24 md:pb-24 px-4 sm:px-0">    

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-10 text-center lg:text-left">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.4em] bg-primary/10 px-5 py-2 rounded-full border border-primary/10 shadow-sm mx-auto lg:mx-0">
             Financial Audit
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-foreground tracking-tighter uppercase italic leading-tight">
            Mastery Ledger.
          </h1>
          <p className="text-text-secondary font-soft text-base md:text-xl max-w-2xl mx-auto lg:mx-0 opacity-80 leading-relaxed">
            &quot;Precision in finance reflects precision in soul.&quot;
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          <ActionButton onClick={() => { setModalType("credit"); setIsModalOpen(true); }} icon={Plus} label="Income" color="text-monk-mint" bg="bg-monk-mint/10" border="border-monk-mint/20" />
          <ActionButton onClick={() => { setModalType("debit"); setIsModalOpen(true); }} icon={Minus} label="Spend" color="text-primary" bg="bg-primary/10" border="border-primary/20" />
          <ActionButton onClick={() => { setModalType("debt"); setIsModalOpen(true); }} icon={HandCoins} label="Debt" color="text-accent" bg="bg-accent/10" border="border-accent/20" />
          <button 
            onClick={clearLedger} 
            className="h-14 w-14 flex items-center justify-center bg-secondary dark:bg-white/5 text-muted-foreground hover:text-rose-500 rounded-2xl transition-all shadow-sm active:scale-90 border border-border"
            title="Reset Ledger"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <FinanceStatCard title="Balance" value={formatCurrency(totalBalance)} icon={Wallet} color="text-text-secondary" bg="bg-secondary/50 dark:bg-secondary/10" />
        <FinanceStatCard title="Earned" value={formatCurrency(monthlyIncome)} icon={TrendingUp} color="text-monk-mint" bg="bg-monk-mint/10" />
        <FinanceStatCard title="Spent" value={formatCurrency(monthlySpent)} icon={TrendingDown} color="text-primary" bg="bg-primary/10" />
        <FinanceStatCard title="Liability" value={formatCurrency(totalOwed)} icon={Users} color="text-accent" bg="bg-accent/10" />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 pb-12">

        {/* Mobile Identity Score */}
        <div className="lg:hidden space-y-6">
           <section className="monk-card p-8 bg-zinc-900 dark:bg-card text-white dark:text-text-primary overflow-hidden relative border-none shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <TrendingUp className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Financial Integrity</h3>
                <div className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", integrityScore > 80 ? "bg-monk-mint/20 text-monk-mint border-monk-mint/30" : "bg-primary/20 text-primary border-primary/30")}>
                  {integrityScore > 80 ? "Pristine" : integrityScore > 50 ? "Stable" : "Critical"}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-6xl font-heading font-black tracking-tighter italic">{integrityScore}%</div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Sync</span>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/10 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${integrityScore}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={cn("h-full rounded-full", integrityScore > 80 ? "bg-monk-mint shadow-[0_0_12px_rgba(142,217,204,0.6)]" : "bg-primary shadow-[0_0_12px_rgba(217,167,167,0.6)]")} />
                </div>
              </div>
            </div>
          </section>

          <div className="monk-card p-6 border-accent/20 bg-accent/5 flex items-center justify-between shadow-sm group hover:border-accent/40 transition-all">        
             <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/60">Liability Protocol</h4>
                <div className="flex gap-8">
                   <div className="flex flex-col gap-0.5"><span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Receivable</span><span className="text-lg font-heading font-black text-monk-mint italic">{formatCurrency(totalReceivable)}</span></div>
                   <div className="flex flex-col gap-0.5"><span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Payable</span><span className="text-lg font-heading font-black text-primary italic">{formatCurrency(totalOwed)}</span></div>
                </div>
             </div>
             <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
               <HandCoins className="h-6 w-6 text-accent" />
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-1.5 p-1.5 bg-secondary/50 dark:bg-secondary/20 rounded-[24px] w-full md:w-fit border border-border shadow-inner">
            {(["history", "bills", "debts"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("flex-1 md:flex-none px-8 h-12 md:h-11 flex items-center justify-center rounded-[18px] text-[11px] md:text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95", activeTab === tab ? "bg-card text-foreground shadow-xl border border-border" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>{tab}</button>
            ))}
          </div>

          <div className="monk-card p-6 md:p-10 min-h-[500px] shadow-sm border-border">
            <AnimatePresence mode="wait">
              {activeTab === "history" && (
                <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-heading font-black italic uppercase tracking-tight text-text-primary">Ledger Records.</h2>
                    <div className="px-4 py-2 bg-secondary/50 dark:bg-white/5 rounded-full border border-border">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">{new Date().toLocaleString('default', { month: 'long' })} Cycle</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {transactions.length === 0 ? <EmptyState message="The ledger is silent." /> : transactions.map((t) => (
                      <TransactionItem key={t.id} transaction={t} onDelete={() => {
                        saveTransactions(transactions.filter(tx => tx.id !== t.id));
                        syncManager.save('finances', 'DELETE', { id: t.id });
                      }} />
                    ))}
                  </div>
                </motion.div>
              )}
              {activeTab === "bills" && (
                <motion.div key="bills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-heading font-black italic uppercase tracking-tight text-text-primary mb-8">Commitments.</h2>
                  <div className="space-y-4">
                    {bills.length === 0 ? <EmptyState message="No recurring protocols." /> : bills.map((b) => ( 
                      <BillItem key={b.id} bill={b} onDelete={() => {
                        saveBills(bills.filter(bl => bl.id !== b.id));
                        syncManager.save('bills', 'DELETE', { id: b.id });
                      }} onToggle={() => {
                        const updated = { ...b, isPaid: !b.isPaid };
                        saveBills(bills.map(bl => bl.id === b.id ? updated : bl));
                        syncManager.save('bills', 'UPDATE', { id: b.id, is_paid: updated.isPaid });
                      }} />
                    ))}
                  </div>
                </motion.div>
              )}
              {activeTab === "debts" && (
                <motion.div key="debts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <h2 className="text-xl md:text-2xl font-heading font-black italic uppercase tracking-tight text-text-primary mb-8">Honor System.</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {debts.length === 0 ? <div className="col-span-full"><EmptyState message="No active honor ties." /></div> : debts.map((d) => (
                      <DebtCard key={d.id} debt={d} onDelete={() => {
                        saveDebts(debts.filter(db => db.id !== d.id));
                        syncManager.save('debts', 'DELETE', { id: d.id });
                      }} onSettle={() => {
                        const updated = { ...d, isSettled: !d.isSettled };
                        saveDebts(debts.map(db => db.id === d.id ? updated : db));
                      }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-4 space-y-5 md:space-y-8">
          <section className="monk-card p-4 md:p-6 bg-zinc-900 dark:bg-card text-white dark:text-text-primary overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-heading font-bold mb-4">Financial Identity Score</h3>
              <div className="text-3xl md:text-4xl font-heading font-bold mb-2">{integrityScore}%</div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">&quot;Precision in finance reflects precision in soul.&quot;</p>
              <div className="mt-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                <span>Ledger Integrity</span>
                <span className={cn("font-bold", integrityScore > 80 ? "text-monk-mint" : "text-primary")}>{integrityScore > 80 ? "Perfect" : integrityScore > 50 ? "Stable" : "Unstable"}</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-secondary/30 rounded-full">
                <motion.div initial={{ width: 0 }} animate={{ width: `${integrityScore}%` }} transition={{ duration: 1 }} className={cn("h-full rounded-full shadow-[0_0_15px]", integrityScore > 80 ? "bg-monk-mint shadow-monk-mint" : "bg-primary shadow-primary")} />
              </div>
            </div>
          </section>

          <div className="monk-card p-4 md:p-6 border-accent/20 bg-accent/5">
             <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Liability Snapshot</h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">They owe you</span>
                   <span className="text-sm font-black text-monk-mint">{formatCurrency(totalReceivable)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">You owe them</span>
                   <span className="text-sm font-black text-primary">{formatCurrency(totalOwed)}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Unified Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg monk-card p-5 md:p-8 shadow-2xl border-2 border-border">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1"><h2 className="text-2xl font-heading font-bold capitalize">{modalType} Entry</h2><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">COMMITMENT TO THE LEDGER</p></div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 md:p-2 hover:bg-secondary dark:bg-secondary/20 rounded-full transition-all"><X /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount (₹)</label>
                    <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full text-3xl font-heading font-bold px-4 py-4 rounded-2xl bg-background border border-border focus:border-primary/50 focus:outline-none transition-all" />
                  </div>
                  {modalType === "debt" && (
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Person / Entity</label><input type="text" required value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Who?" className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary font-soft" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Debt Category</label><select value={debtType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDebtType(e.target.value as "owe" | "receivable")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary font-soft cursor-pointer"><option value="owe">I Owe This</option><option value="receivable">I Am Owed This</option></select></div>
                    </div>
                  )}
                  <div className="col-span-2 space-y-2"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reason / Description</label><input type="text" required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Salary, Rent, Food" className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary font-soft" /></div>
                </div>
                <button type="submit" className="w-full py-5 rounded-2xl bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Save to Ledger</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
interface ActionButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  border: string;
}

function ActionButton({ onClick, icon: Icon, label, color, bg, border }: ActionButtonProps) {
  return (<button onClick={onClick} className={cn("flex items-center justify-center gap-2 px-5 h-11 font-bold rounded-2xl border-2 transition-all hover:scale-105", bg, color, border)}><Icon className="h-4 w-4" /> {label}</button>);
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-center py-20 text-muted-foreground italic font-soft">{message}</div>;
}

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: () => void;
}

function TransactionItem({ transaction: t, onDelete }: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border group hover:border-border hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", t.type === 'credit' ? "bg-monk-mint/10 text-monk-mint" : "bg-primary/10 text-primary")}>
          {t.type === 'credit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
        </div>
        <div><div className="font-bold text-sm">{t.reason}</div><div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{t.category} • {t.date}</div></div>
      </div>
      <div className="flex items-center gap-4">
        <div className={cn("font-heading font-bold text-lg", t.type === 'credit' ? "text-monk-mint" : "text-primary")}>{t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}</div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-muted-foreground hover:text-red-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:inline-flex"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

interface BillItemProps {
  bill: Bill;
  onDelete: () => void;
  onToggle: () => void;
}

function BillItem({ bill, onDelete, onToggle }: BillItemProps) {
  return (
    <div className={cn("flex items-center justify-between p-5 rounded-2xl border-2 transition-all group", bill.isPaid ? "bg-monk-mint/5 border-monk-mint/20 opacity-60" : "bg-background border-secondary/20 hover:border-secondary/40")}>
      <div className="flex items-center gap-4"><div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", bill.isPaid ? "bg-monk-mint text-zinc-900" : "bg-secondary dark:bg-secondary/10 text-secondary")}><Calendar className="h-5 w-5" /></div><div><div className={cn("font-bold", bill.isPaid && "line-through")}>{bill.title}</div><div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Due: {bill.dueDate}</div></div></div>
      <div className="flex items-center gap-6"><div className="text-right"><div className="font-heading font-bold text-lg">{formatCurrency(bill.amount)}</div><button onClick={onToggle} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">{bill.isPaid ? "Undo" : "Mark as Paid"}</button></div><button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-muted-foreground hover:text-red-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:inline-flex"><Trash2 className="h-4 w-4" /></button></div>
    </div>
  );
}

interface DebtCardProps {
  debt: Debt;
  onDelete: () => void;
  onSettle: () => void;
}

function DebtCard({ debt, onDelete, onSettle }: DebtCardProps) {
  return (
    <div className={cn("p-6 rounded-[24px] border-2 flex flex-col justify-between group h-52 transition-all relative overflow-hidden", debt.isSettled ? "bg-secondary/5 border-secondary/20 opacity-60" : debt.type === 'receivable' ? "bg-monk-mint/5 border-monk-mint/10 hover:border-monk-mint/30 shadow-sm" : "bg-primary/5 border-primary/10 hover:border-primary/30 shadow-sm")}>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="h-11 w-11 md:h-10 md:w-10 rounded-xl bg-secondary dark:bg-secondary/20 flex items-center justify-center"><Users className={cn("h-5 w-5", debt.type === 'receivable' ? "text-monk-mint" : "text-primary")} /></div>
        <div className="flex items-center gap-2"><span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", debt.isSettled ? "bg-secondary text-muted-foreground" : debt.type === 'receivable' ? "bg-monk-mint text-zinc-900" : "bg-primary text-white")}>{debt.isSettled ? 'Settled' : debt.type === 'receivable' ? 'Lent' : 'Borrowed'}</span><button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-muted-foreground hover:text-red-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:inline-flex"><X className="h-4 w-4" /></button></div>
      </div>
      <div className="relative z-10"><div className={cn("text-xl font-heading font-bold", debt.isSettled && "line-through")}>{debt.personName}</div><div className="text-xs text-muted-foreground font-medium italic line-clamp-1">&quot;{debt.reason}&quot;</div><div className={cn("text-2xl font-heading font-bold mt-2", debt.isSettled ? "text-muted-foreground" : debt.type === 'receivable' ? "text-monk-mint" : "text-primary")}>{formatCurrency(debt.amount)}</div></div>
      <div className="mt-4 pt-4 border-t border-monk-rose/5 relative z-10"><button onClick={onSettle} className={cn("w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", debt.isSettled ? "bg-secondary dark:bg-secondary/20 text-muted-foreground" : "bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground hover:scale-105")}>{debt.isSettled ? "Mark as Active" : "Mark as Settled"}</button></div>
    </div>
  );
}

interface FinanceStatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  description?: string;
}

function FinanceStatCard({ title, value, icon: Icon, color, bg, description }: FinanceStatCardProps) {
  return (
    <div className="monk-card p-5 flex flex-col gap-3 group hover:border-border hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", bg)}><Icon className={cn("h-6 w-6", color)} /></div>
        <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p><p className="text-xl font-heading font-bold text-foreground">{value}</p></div>
      </div>
      {description && <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-1">{description}</p>}
    </div>
  );
}
