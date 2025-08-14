// app/components/RoleForm.jsx
"use client";

import { useState } from "react";
import Button from "./Button"; 

export default function RoleForm({ entryId, currentRole }) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const res = await fetch(`/api/user-role/${entryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      console.error("Failed to update role");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border border-gray-300 px-3 py-2 rounded-md text-sm"
      >
        <option value="admin">Admin</option>
        <option value="member">Member</option>
        <option value="tenant">Tenant</option>
      </select>

      <div className="min-w-[100px]">
        <Button
          type="submit"
          text={loading ? "Saving..." : success ? "✔ Saved" : "Update"}
        />
      </div>
    </form>
  );
}
