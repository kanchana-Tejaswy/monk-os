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
  CheckCircle2,
  Trash2,
  X,
  RotateCcw,
  Receipt,
  HandCoins,
  AlertCircle
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
}

type ModalType = "credit" | "debit" | "bill" | "debt";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"history" | "bills" | "debts">("history");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("credit");
  
  // Form States
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [personName, setPersonName] = useState("");
  const [debtType, setDebtType] = useState<"owe" | "receivable">("owe");
  const [repeatInterval, setRepeatInterval] = useState<"Monthly" | "One-time">("Monthly");

  // Load Data
  useEffect(() => {
    const savedTx = localStorage.getItem("monk_os_finance");
    const savedBills = localStorage.getItem("monk_os_bills");
    const savedDebts = localStorage.getItem("monk_os_debts");
    
    if (savedTx) setTransactions(JSON.parse(savedTx));
    if (savedBills) setBills(JSON.parse(savedBills));
    if (savedDebts) setDebts(JSON.parse(savedDebts));
  }, []);

  // Persistence Handlers
  const updateData = (key: string, data: any, setter: Function) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const id = Math.random().toString(36).substr(2, 9);
    const parsedAmount = parseFloat(amount);

    if (modalType === "credit" || modalType === "debit") {
      const newTx: Transaction = {
        id,
        type: modalType,
        amount: parsedAmount,
        reason,
        category,
        date: new Date().toISOString().split('T')[0],
      };
      updateData("monk_os_finance", [newTx, ...transactions], setTransactions);
    } else if (modalType === "bill") {
      const newBill: Bill = {
        id,
        title: reason,
        amount: parsedAmount,
        dueDate,
        isPaid: false,
        repeatInterval,
      };
      updateData("monk_os_bills", [newBill, ...bills], setBills);
    } else if (modalType === "debt") {
      const newDebt: Debt = {
        id,
        personName,
        amount: parsedAmount,
        type: debtType,
        reason,
        dueDate,
      };
      updateData("monk_os_debts", [newDebt, ...debts], setDebts);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setAmount("");
    setReason("");
    setCategory("General");
    setDueDate("");
    setPersonName("");
    setDebtType("owe");
  };

  // Calculations
  const totalBalance = transactions.reduce((acc, curr) => curr.type === "credit" ? acc + curr.amount : acc - curr.amount, 0);
  const monthlyIncome = transactions.filter(t => t.type === "credit").reduce((acc, curr) => acc + curr.amount, 0);
  const monthlySpent = transactions.filter(t => t.type === "debit").reduce((acc, curr) => acc + curr.amount, 0);
  const totalOwed = debts.filter(d => d.type === "owe").reduce((acc, curr) => acc + curr.amount, 0);
  const totalReceivable = debts.filter(d => d.type === "receivable").reduce((acc, curr) => acc + curr.amount, 0);

  const clearLedger = () => {
    if (confirm("Are you sure you want to clear your Finance Ledger? This will wipe Transactions, Bills, and Debts, but preserve your Habits and Journal progress.")) {
      localStorage.removeItem("monk_os_finance");
      localStorage.removeItem("monk_os_bills");
      localStorage.removeItem("monk_os_debts");
      setTransactions([]);
      setBills([]);
      setDebts([]);
      alert("Finance ledger cleared.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Finance Discipline</h1>
          <p className="text-muted-foreground mt-1">Total control over your credits, debits, and responsibilities.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton onClick={() => { setModalType("credit"); setIsModalOpen(true); }} icon={Plus} label="Add Money" color="text-monk-mint" bg="bg-monk-mint/10" border="border-monk-mint/20" />
          <ActionButton onClick={() => { setModalType("debit"); setIsModalOpen(true); }} icon={Minus} label="Spend" color="text-primary" bg="bg-primary/10" border="border-primary/20" />
          <ActionButton onClick={() => { setModalType("bill"); setIsModalOpen(true); }} icon={Receipt} label="Add Bill" color="text-secondary" bg="bg-secondary/10" border="border-secondary/20" />
          <ActionButton onClick={() => { setModalType("debt"); setIsModalOpen(true); }} icon={HandCoins} label="Add Debt" color="text-accent" bg="bg-accent/10" border="border-accent/20" />
          <button 
            onClick={clearLedger}
            className="p-3 bg-secondary/10 text-muted-foreground hover:text-red-500 rounded-2xl transition-all"
            title="Clear Ledger"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinanceStatCard title="Total Balance" value={formatCurrency(totalBalance)} icon={Wallet} color="text-secondary" bg="bg-secondary/10" />
        <FinanceStatCard title="Monthly Income" value={formatCurrency(monthlyIncome)} icon={TrendingUp} color="text-monk-mint" bg="bg-monk-mint/10" />
        <FinanceStatCard title="Net Owe" value={formatCurrency(totalOwed)} icon={TrendingDown} color="text-primary" bg="bg-primary/10" />
        <FinanceStatCard title="Receivable" value={formatCurrency(totalReceivable)} icon={CheckCircle2} color="text-accent" bg="bg-accent/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 p-1 bg-secondary/20 rounded-2xl w-fit">
            {(["history", "bills", "debts"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                  activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="monk-card p-6 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === "history" && (
                <motion.div key="history" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                  <h2 className="text-xl font-heading font-bold mb-6">Recent Transactions</h2>
                  {transactions.length === 0 ? (
                    <EmptyState message="No transactions recorded." />
                  ) : (
                    transactions.map((t) => (
                      <TransactionItem key={t.id} transaction={t} onDelete={() => updateData("monk_os_finance", transactions.filter(tx => tx.id !== t.id), setTransactions)} />
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === "bills" && (
                <motion.div key="bills" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                  <h2 className="text-xl font-heading font-bold mb-6">Upcoming Bills</h2>
                  {bills.length === 0 ? (
                    <EmptyState message="No active bills." />
                  ) : (
                    bills.map((b) => (
                      <BillItem 
                        key={b.id} 
                        bill={b} 
                        onDelete={() => updateData("monk_os_bills", bills.filter(bl => bl.id !== b.id), setBills)}
                        onToggle={() => updateData("monk_os_bills", bills.map(bl => bl.id === b.id ? { ...bl, isPaid: !bl.isPaid } : bl), setBills)}
                      />
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === "debts" && (
                <motion.div key="debts" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                  <h2 className="text-xl font-heading font-bold mb-6">Debt & Receivables</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {debts.length === 0 ? (
                      <div className="col-span-full"><EmptyState message="No debts recorded." /></div>
                    ) : (
                      debts.map((d) => (
                        <DebtCard 
                          key={d.id} 
                          debt={d} 
                          onDelete={() => updateData("monk_os_debts", debts.filter(db => db.id !== d.id), setDebts)} 
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="monk-card p-6 bg-[#2E2E2E] text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-heading font-bold mb-4">Identity Integrity</h3>
              <div className="text-4xl font-heading font-bold mb-2">92%</div>
              <p className="text-sm text-white/60 leading-relaxed italic">
                "Financial discipline is a form of self-respect."
              </p>
              <div className="mt-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                <span>Log Consistency</span>
                <span className="text-monk-mint">Perfect</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full">
                <div className="h-full bg-monk-mint w-[92%] rounded-full shadow-[0_0_15px_#C7EDE6]" />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Unified Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg monk-card p-8 shadow-2xl border-2 border-monk-rose/20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-heading font-bold capitalize">{modalType.replace('_', ' ')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary/20 rounded-full transition-all"><X /></button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount (₹)</label>
                    <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full text-3xl font-heading font-bold px-4 py-4 rounded-2xl bg-background border border-monk-rose/20 focus:border-primary/50 focus:outline-none transition-all" />
                  </div>

                  {modalType === "debt" && (
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Person Name</label>
                        <input type="text" required value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Name" className="w-full px-4 py-3 rounded-xl bg-background border border-monk-rose/20 focus:outline-none focus:border-primary font-soft" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Debt Type</label>
                        <select value={debtType} onChange={(e: any) => setDebtType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-monk-rose/20 focus:outline-none focus:border-primary font-soft">
                          <option value="owe">I Owe</option>
                          <option value="receivable">They Owe Me</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reason / Title</label>
                    <input type="text" required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What was this for?" className="w-full px-4 py-3 rounded-xl bg-background border border-monk-rose/20 focus:outline-none focus:border-primary font-soft" />
                  </div>

                  {(modalType === "bill" || modalType === "debt") && (
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Due Date</label>
                      <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-monk-rose/20 focus:outline-none focus:border-primary font-soft" />
                    </div>
                  )}

                  {modalType === "bill" && (
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interval</label>
                      <select value={repeatInterval} onChange={(e: any) => setRepeatInterval(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-monk-rose/20 focus:outline-none font-soft">
                        <option value="Monthly">Monthly</option>
                        <option value="One-time">One-time</option>
                      </select>
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full py-5 rounded-2xl bg-foreground text-background font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  Save to Ledger
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Components
function ActionButton({ onClick, icon: Icon, label, color, bg, border }: any) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-2 px-5 py-2.5 font-bold rounded-2xl border-2 transition-all hover:scale-105", bg, color, border)}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-center py-20 text-muted-foreground italic font-soft">{message}</div>;
}

function TransactionItem({ transaction: t, onDelete }: { transaction: Transaction, onDelete: any }) {
  return (
    <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-monk-rose/10 group hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", t.type === 'credit' ? "bg-monk-mint/10 text-monk-mint" : "bg-primary/10 text-primary")}>
          {t.type === 'credit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
        </div>
        <div>
          <div className="font-bold text-sm">{t.reason}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{t.category} • {t.date}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className={cn("font-heading font-bold text-lg", t.type === 'credit' ? "text-monk-mint" : "text-primary")}>
          {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
        </div>
        <button onClick={onDelete} className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function BillItem({ bill, onDelete, onToggle }: { bill: Bill, onDelete: any, onToggle: any }) {
  return (
    <div className={cn("flex items-center justify-between p-5 rounded-2xl border-2 transition-all group", bill.isPaid ? "bg-monk-mint/5 border-monk-mint/20 opacity-60" : "bg-background border-secondary/20 hover:border-secondary/40")}>
      <div className="flex items-center gap-4">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", bill.isPaid ? "bg-monk-mint text-white" : "bg-secondary/10 text-secondary")}>
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <div className={cn("font-bold", bill.isPaid && "line-through")}>{bill.title}</div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Due: {bill.dueDate} • {bill.repeatInterval}</div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="font-heading font-bold text-lg">{formatCurrency(bill.amount)}</div>
          <button onClick={onToggle} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
            {bill.isPaid ? "Undo Paid" : "Mark as Paid"}
          </button>
        </div>
        <button onClick={onDelete} className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function DebtCard({ debt, onDelete }: { debt: Debt, onDelete: any }) {
  return (
    <div className={cn("p-6 rounded-[24px] border-2 flex flex-col justify-between group h-48", debt.type === 'receivable' ? "bg-monk-mint/5 border-monk-mint/10 hover:border-monk-mint/30" : "bg-primary/5 border-primary/10 hover:border-primary/30")}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-white/50 flex items-center justify-center">
          <Users className={cn("h-5 w-5", debt.type === 'receivable' ? "text-monk-mint" : "text-primary")} />
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", debt.type === 'receivable' ? "bg-monk-mint text-white shadow-lg shadow-monk-mint/20" : "bg-primary text-white shadow-lg shadow-primary/20")}>
            {debt.type === 'receivable' ? 'Lent' : 'Borrowed'}
          </span>
          <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X className="h-4 w-4" /></button>
        </div>
      </div>
      <div>
        <div className="text-xl font-heading font-bold">{debt.personName}</div>
        <div className="text-xs text-muted-foreground font-medium italic">"{debt.reason}"</div>
        <div className={cn("text-2xl font-heading font-bold mt-2", debt.type === 'receivable' ? "text-monk-mint" : "text-primary")}>
          {formatCurrency(debt.amount)}
        </div>
      </div>
    </div>
  );
}

function FinanceStatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="monk-card p-5 flex items-center gap-4">
      <div className={cn("p-3 rounded-2xl", bg)}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-xl font-heading font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
