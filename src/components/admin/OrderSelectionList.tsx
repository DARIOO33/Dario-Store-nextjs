"use client";

import { Children, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/src/prisma/orders";
import { bulkDeleteCancelledOrdersAction, bulkSetOrderStatusAction } from "@/src/actions/orders";

type Row = { id: string; orderNumber: number; status: OrderStatus };

export default function OrderSelectionList({ rows, children, isAdmin }: { rows: Row[]; children: ReactNode; isAdmin: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<OrderStatus>("PAID");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selectedSet = new Set(selected);
  const allSelected = rows.length > 0 && rows.every((row) => selectedSet.has(row.id));
  const cards = Children.toArray(children);

  const toggleAll = () => setSelected(allSelected ? [] : rows.map((row) => row.id));
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const updateStatus = async () => {
    if (!selected.length || !confirm(`Change the status of ${selected.length} selected orders to ${status.toLowerCase()}?`)) return;
    setBusy(true);
    setMessage("");
    const result = await bulkSetOrderStatusAction(selected, status);
    if (!result.ok) setMessage(result.error);
    else {
      setMessage(`${result.updated} updated${result.failed.length ? `; ${result.failed.length} could not be changed` : ""}.`);
      setSelected(result.failed);
      router.refresh();
    }
    setBusy(false);
  };

  const deleteOrders = async () => {
    if (!selected.length || !confirm(`Permanently delete ${selected.length} selected cancelled orders? Their items, chats and chat photos are removed. This can't be undone.`)) return;
    setBusy(true);
    setMessage("");
    const result = await bulkDeleteCancelledOrdersAction(selected);
    if (!result.ok) setMessage(result.error);
    else {
      setMessage(`${result.deleted} deleted${result.failed.length ? `; ${result.failed.length} could not be deleted` : ""}.`);
      setSelected(result.failed);
      router.refresh();
    }
    setBusy(false);
  };

  return (
    <>
      <div className="orderBulkBar">
        <label className="orderSelectAll"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all orders on this page" /> Select page</label>
        <span className="muted">{selected.length} selected</span>
        <select className="input" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)} aria-label="New status">
          {(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as OrderStatus[]).map((item) => <option key={item} value={item}>{item.charAt(0) + item.slice(1).toLowerCase()}</option>)}
        </select>
        <button type="button" className="btn btnAccent btnSm" disabled={!selected.length || busy} onClick={updateStatus}>{busy ? "Working…" : "Change status"}</button>
        {isAdmin && <button type="button" className="btn btnGhost btnSm" disabled={!selected.length || busy} onClick={deleteOrders}>Delete cancelled</button>}
        {message && <span className="muted" role="status">{message}</span>}
      </div>
      <ul className="orderList">
        {rows.map((row, index) => (
          <li className="orderListRow" key={row.id}>
            <input type="checkbox" checked={selectedSet.has(row.id)} onChange={() => toggle(row.id)} aria-label={`Select order #${row.orderNumber}`} />
            {cards[index]}
          </li>
        ))}
      </ul>
    </>
  );
}
