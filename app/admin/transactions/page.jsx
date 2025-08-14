// app/admin/transactions/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Button from "../../components/Button";

export default function TransactionFormPage() {
  const router = useRouter();
  const { userId } = useAuth();

  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const [formData, setFormData] = useState({
    uniqueId: "",
    tranDate: "",
    type: "",
    amount: "",
    property: "",
    payerPayee: "",
    filepath: "",
    notes: "",
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  useEffect(() => {
    if (!userId) {
      router.replace("/sign-in");
      return;
    }
    fetch(`/api/get-user-role?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setRole(data.role === "admin" ? "admin" : "not-admin");
      })
      .catch((err) => {
        console.error("Role fetch failed:", err);
        setRole("not-admin");
      })
      .finally(() => setLoadingRole(false));
  }, [userId, router]);

  useEffect(() => {
    if (!loadingRole && role !== "admin") {
      router.replace("/"); // Redirect non-admin users
    }
  }, [loadingRole, role, router]);

  if (loadingRole) return <div>Loading...</div>;
  if (role !== "admin") return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setReceiptFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!receiptFile) {
    toast.error("Please upload a receipt image.");
    return;
  }

  const data = new FormData();

  const safeFormData = { ...formData };

  // ✅ Ensure tranDate is in YYYY-MM-DD format
  if (safeFormData.tranDate) {
    const isoDate = new Date(safeFormData.tranDate).toISOString().split("T")[0];
    safeFormData.tranDate = isoDate;
  }

  Object.entries(safeFormData).forEach(([k, v]) => data.append(k, v));
  data.append("receiptImage", receiptFile);

  try {
    const res = await fetch("/api/transaction", {
      method: "POST",
      body: data,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to upload transaction.");
    }
    toast.success("Transaction added!");
    router.push("/dashboard");
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
};


  return (
    <div className="flex justify-center items-center bg-black py-4 rounded-2xl">
      <section className="bg-white rounded-2xl p-12 w-full max-w-4xl border-4 border-black">
        <h2 className="text-center text-4xl font-semibold text-gray-800 mb-2">
          Add Transaction
        </h2>
        <p className="text-center text-lg text-gray-500 mb-8">
          Fill in the details below to add a new transaction.
        </p>

        {receiptPreview && (
          <img
            src={receiptPreview}
            alt="Receipt Preview"
            className="w-full h-[400px] object-contain rounded-xl mb-6"
          />
        )}

        <div className="mb-6">
          <label className="block mb-1 font-semibold">Receipt Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} required />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Unique ID */}
          <div>
            <label className="block mb-1 font-semibold">Unique ID</label>
            <input
              name="uniqueId"
              type="text"
              value={formData.uniqueId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Transaction Date */}
          <div>
            <label className="block mb-1 font-semibold">Transaction Date</label>
            <input
              name="tranDate"
              type="date"
              value={formData.tranDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Type Dropdown */}
          <div>
            <label className="block mb-1 font-semibold">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="" disabled>
                Select type
              </option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block mb-1 font-semibold">Amount</label>
            <input
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Property */}
          <div>
            <label className="block mb-1 font-semibold">Property</label>
            <input
              name="property"
              type="text"
              value={formData.property}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Payer/Payee */}
          <div>
            <label className="block mb-1 font-semibold">Payer/Payee</label>
            <input
              name="payerPayee"
              type="text"
              value={formData.payerPayee}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* File Path */}
          <div>
            <label className="block mb-1 font-semibold">File Path</label>
            <input
              name="filepath"
              type="text"
              value={formData.filepath}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block mb-1 font-semibold">Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="text-center">
            <Button type="submit" text="Submit Transaction" />
          </div>
        </form>
      </section>
    </div>
  );
}
