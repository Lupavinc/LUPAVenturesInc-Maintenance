// admin/transactions/edit/[id]
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "../../../../components/Button";

export default function EditReceiptPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const [formData, setFormData] = useState({
    uniqueId: "",
    tranDate: "",
    type: "",
    amount: "",
    property: "",
    payerPayee: "",
    filepath: "",
    notes: "",
    receiptImageUrl: "",
  });

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await fetch(`/api/transaction/${id}`);
        if (!res.ok) throw new Error("Failed to fetch receipt.");
        const receipt = await res.json();
        const fields = receipt.fields || receipt;

        setFormData({
          uniqueId: fields.uniqueId || "",
          tranDate: fields.tranDate || "",
          type: fields.type || "",
          amount: fields.amount?.toString() || "",
          property: fields.property || "",
          payerPayee: fields.payerPayee || "",
          filepath: fields.filepath || "",
          notes: fields.notes || "",
          receiptImageUrl: fields.receiptImageUrl || fields.receiptImage?.url || "",
        });

        if (fields.receiptImageUrl || fields.receiptImage?.url) {
          setReceiptPreview(fields.receiptImageUrl || fields.receiptImage.url);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load receipt.");
        setLoading(false);
      }
    };

    if (id) fetchReceipt();
  }, [id]);

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
      setReceiptPreview(formData.receiptImageUrl || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "receiptImageUrl") {
        data.append(key, value);
      }
    });

    if (receiptFile) {
      data.append("receiptImage", receiptFile);
    }

    try {
      const res = await fetch(`/api/transaction/${id}`, {
        method: "PUT",
        body: data,
      });

      if (!res.ok) throw new Error("Failed to update receipt.");

      toast.success("Receipt updated successfully.");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Update failed.");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center bg-black py-4 rounded-2xl text-white min-h-screen">
      <section className="bg-white rounded-2xl p-12 w-full max-w-4xl border-4 border-black text-gray-800">
        <h2 className="text-center text-4xl font-semibold mb-6">Edit Receipt</h2>

        {/* Receipt Image Preview */}
        {receiptPreview && (
          <div className="mb-6">
            <img
              src={receiptPreview}
              alt="Receipt Preview"
              className="w-full h-64 object-contain border rounded"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div>
            <label className="block mb-1 font-semibold">Unique ID</label>
            <input
              name="uniqueId"
              value={formData.uniqueId}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Transaction Date</label>
            <input
              type="date"
              name="tranDate"
              value={formData.tranDate}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Type</label>
            <input
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Amount</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Property</label>
            <input
              name="property"
              value={formData.property}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Payer/Payee</label>
            <input
              name="payerPayee"
              value={formData.payerPayee}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">File Path</label>
            <input
              name="filepath"
              value={formData.filepath}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Upload New Receipt (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="text-center">
            <Button type="submit" text="Update Receipt" />
          </div>
        </form>
      </section>
    </div>
  );
}
