"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

export default function ExportTransactionPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.replace("/sign-in");
      return;
    }
    fetch(`/api/get-user-role?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.role !== "admin") router.replace("/");
        else setIsAdmin(true);
      })
      .catch(() => router.replace("/"));
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const res = await fetch("/api/transaction/export");
        if (!res.ok) throw new Error("Failed to fetch transactions.");
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error(err);
        toast.error("Error loading transactions.");
      }
    })();
  }, [isAdmin]);

  useEffect(() => {
    let data = [...transactions];

    if (searchTerm) {
      data = data.filter((txn) =>
        txn.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (dateFrom) data = data.filter((txn) => new Date(txn.tranDate) >= new Date(dateFrom));
    if (dateTo) data = data.filter((txn) => new Date(txn.tranDate) <= new Date(dateTo));

    setFiltered(data);
  }, [transactions, searchTerm, dateFrom, dateTo]);

  const totalIncome = filtered
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filtered
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const handleExport = () => {
    const companyName = "LUPA Ventures Inc.";
    const reportTitle = "Transaction Report";
    const dateGenerated = new Date().toLocaleString();

    const headers = [
      "Unique ID",
      "Date",
      "Type",
      "Amount",
      "Property",
      "Payer/Payee",
      "Notes",
    ];

    const rows = filtered.map((txn) => [
      txn.uniqueId,
      txn.tranDate,
      txn.type,
      Number(txn.amount).toFixed(2), // formatted to 2 decimals
      txn.property,
      txn.payerPayee,
      txn.notes,
    ]);

    const csvContent = [
      [`Company: ${companyName}`],
      [reportTitle],
      [`Date Generated: ${dateGenerated}`],
      [],
      headers,
      ...rows,
      [],
      ["", "", "Total Income", totalIncome.toFixed(2)],
      ["", "", "Total Expenses", totalExpense.toFixed(2)],
      ["", "", "Balance", balance.toFixed(2)],
    ]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "transactions_export.csv");
  };

  if (!isAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">🧾 Export Transaction Report</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Search by Transaction ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded flex-1 min-w-[200px]"
        />
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-6 text-gray-700 flex gap-8">
        <div>
          <strong>Total Income:</strong> ${totalIncome.toFixed(2)}
        </div>
        <div>
          <strong>Total Expenses:</strong> ${totalExpense.toFixed(2)}
        </div>
        <div>
          <strong>Balance:</strong> ${balance.toFixed(2)}
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Property</th>
              <th className="p-2 border">Payer/Payee</th>
              <th className="p-2 border">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((txn) => (
                <tr key={txn.uniqueId} className="hover:bg-gray-50">
                  <td className="p-2 border">{txn.uniqueId}</td>
                  <td className="p-2 border">{txn.tranDate}</td>
                  <td className="p-2 border">{txn.type}</td>
                  <td className="p-2 border">
                    ${Number(txn.amount).toFixed(2)}
                  </td>
                  <td className="p-2 border">{txn.property}</td>
                  <td className="p-2 border">{txn.payerPayee}</td>
                  <td className="p-2 border">{txn.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
