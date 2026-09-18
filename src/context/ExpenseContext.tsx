import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type LocalExpense = {
  id: string;
  amount: number;
  currency: "JPY" | "KRW";
  merchant: string;
  timestamp: number;
  source: "notification";
};

type ExpenseContextValue = {
  expenses: LocalExpense[];
  hydrated: boolean;
  confirmNotificationExpense: (expense: Omit<LocalExpense, "source">) => void;
  removeExpense: (id: string) => void;
  todayJpyTotal: number;
  todayKrwTotal: number;
};

const STORAGE_KEY = "tripnow:local-expenses:v1";
const ExpenseContext = createContext<ExpenseContextValue | null>(null);

function isSameLocalDay(timestamp: number, now = Date.now()) {
  const left = new Date(timestamp);
  const right = new Date(now);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isLocalExpense(value: unknown): value is LocalExpense {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LocalExpense>;
  return (
    typeof item.id === "string" &&
    typeof item.amount === "number" &&
    item.amount > 0 &&
    (item.currency === "JPY" || item.currency === "KRW") &&
    typeof item.merchant === "string" &&
    typeof item.timestamp === "number" &&
    item.source === "notification"
  );
}

export function ExpenseProvider({ children }: PropsWithChildren) {
  const [expenses, setExpenses] = useState<LocalExpense[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        setExpenses(Array.isArray(parsed) ? parsed.filter(isLocalExpense) : []);
      } catch {
        setExpenses([]);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses, hydrated]);

  const value = useMemo<ExpenseContextValue>(() => {
    const todayExpenses = expenses.filter((item) => isSameLocalDay(item.timestamp));

    return {
      expenses,
      hydrated,
      confirmNotificationExpense: (expense) => {
        setExpenses((current) => {
          if (current.some((item) => item.id === expense.id)) return current;
          return [{ ...expense, source: "notification" }, ...current];
        });
      },
      removeExpense: (id) => {
        setExpenses((current) => current.filter((item) => item.id !== id));
      },
      todayJpyTotal: todayExpenses
        .filter((item) => item.currency === "JPY")
        .reduce((sum, item) => sum + item.amount, 0),
      todayKrwTotal: todayExpenses
        .filter((item) => item.currency === "KRW")
        .reduce((sum, item) => sum + item.amount, 0),
    };
  }, [expenses, hydrated]);

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error("useExpenses must be used inside ExpenseProvider.");
  return context;
}
