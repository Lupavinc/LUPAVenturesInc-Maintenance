// app/dashboard/TransactionTable.jsx
"use client";

import { useState, useMemo } from "react";
import Button from "../components/Button";
import { useRouter } from "next/navigation";

export default function TransactionTable({ transactions }) {
  const router = useRouter();

  // Filters
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const res = await fetch(`/api/transaction/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      alert("Transaction deleted successfully.");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete transaction.");
    }
  };

  const filteredTransactions = useMemo(() => {
  return transactions.filter((t) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      (t.uniqueId?.toLowerCase().includes(search)) ||
      (t.payerPayee?.toLowerCase().includes(search)) ||
      (t.property?.toLowerCase().includes(search));

    const matchesType =
        selectedType === "all" || t.type?.toLowerCase() === selectedType.toLowerCase();

        const amount = t.amount ?? 0;
        const matchesMin = minAmount === "" || amount >= parseFloat(minAmount);
        const matchesMax = maxAmount === "" || amount <= parseFloat(maxAmount);

        const tranDate = new Date(t.date);
        const matchesStartDate = startDate === "" || tranDate >= new Date(startDate);
        const matchesEndDate = endDate === "" || tranDate <= new Date(endDate);

        return (
        matchesSearch &&
        matchesType &&
        matchesMin &&
        matchesMax &&
        matchesStartDate &&
        matchesEndDate
        );
    });
}, [transactions, searchText, selectedType, minAmount, maxAmount, startDate, endDate]);

  const transactionTypes = Array.from(
    new Set(transactions.map((t) => t.type).filter(Boolean))
  );

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-10 shadow-lg rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl font-semibold text-gray-800">Transaction Records</h1>
          <Button
            text="Add New"
            link="/admin/transactions"
            className="bg-yellow-400 text-black hover:bg-yellow-500 min-w-[150px] h-12"
          />
        </div>

        {/* 🔍 Filter Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search unique ID, payer/payee, or property"
            className="p-2 border border-gray-300 rounded-md md:col-span-3"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Types</option>
            {transactionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* 🔍 Filter Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <input
            type="number"
            placeholder="Min Amount"
            className="p-2 border border-gray-300 rounded-md"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Amount"
            className="p-2 border border-gray-300 rounded-md"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
          <input
            type="date"
            className="p-2 border border-gray-300 rounded-md"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="p-2 border border-gray-300 rounded-md"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* 🧾 Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-600">No matching transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                  <th className="border px-4 py-4">Unique ID</th>
                  <th className="border px-4 py-4">Date</th>
                  <th className="border px-4 py-4">Type</th>
                  <th className="border px-4 py-4">Amount</th>
                  <th className="border px-4 py-4">Property</th>
                  <th className="border px-4 py-4">Payer/Payee</th>
                  <th className="border px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t, idx) => (
                  <tr key={t.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border px-4 py-4">{t.uniqueId || "-"}</td>
                    <td className="border px-4 py-4">
                      {t.date ? new Date(t.date).toISOString().split("T")[0] : "-"}
                    </td>
                    <td className="border px-4 py-4">{t.type}</td>
                    <td className="border px-4 py-4">${t.amount?.toFixed(2)}</td>
                    <td className="border px-4 py-4">{t.property}</td>
                    <td className="border px-4 py-4">{t.payerPayee}</td>
                    <td className="border px-4 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          text="Edit"
                          link={`/admin/transactions/edit/${t.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-black rounded min-w-[100px] h-10 flex items-center justify-center"
                        />
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="bg-red-600 hover:bg-red-700 text-white rounded min-w-[100px] h-10 flex items-center justify-center"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
