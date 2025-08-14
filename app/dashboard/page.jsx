//app/dashboard/page.jsx
import { contentfulServerClient } from "../lib/contentful-server";
import TransactionTable from "./TransactionTable"; // ✅ new client component

export const dynamic = "force-dynamic";

export default async function TransactionListPage() {
  const entries = await contentfulServerClient.getEntries({
    content_type: "transactions",
    order: "-fields.tranDate",
  });

  const transactions = entries.items.map((t) => {
    const f = t.fields;
    return {
      id: t.sys.id,
      uniqueId: f.uniqueId || "",
      date: f.tranDate,
      type: f.type,
      amount: f.amount,
      property: f.property,
      payerPayee: f.payerPayee,
      imageUrl: f.receiptImage?.fields?.file?.url
        ? `https:${f.receiptImage.fields.file.url}`
        : null,
    };
  });

  return <TransactionTable transactions={transactions} />;
}
