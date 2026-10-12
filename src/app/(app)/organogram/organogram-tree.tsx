"use client";

/**
 * OrganogramTree — session-30 (R29-B): the organogram drag-drop superset.
 *
 * REF /organogram ships zero draggables (re-verified this round — both apps
 * render the empty state; REF is zero-data). The clone supersedes with the
 * proven DnD pattern from rounds 26–28: draggable node cards, drop targets
 * with the insertion ring, and real re-parenting through the employees
 * PATCH (managerId) — the employee edit form stays the keyboard path.
 *
 * The server page keeps the tree build (roots, render cycle guard, direct
 * reports) and passes the serializable trees as props; this island renders
 * the exact same DOM as the previous server render plus the DnD wiring —
 * nothing renders differently at rest except the cursor-grab affordance
 * (the round-27 hover-state superset precedent).
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { initials } from "@/lib/utils";

export interface OrgNodeData {
  id: string;
  name: string;
  jobTitle: string | null;
  department: string | null;
  avatarUrl: string | null;
  directReports: number;
  children: OrgNodeData[];
}

/* ------------------------------------------------------------------ */
/* Tree surgery helpers — pure functions over a deep-cloned tree.      */
/* ------------------------------------------------------------------ */

function findNode(nodes: OrgNodeData[], id: string): OrgNodeData | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const hit = findNode(n.children, id);
    if (hit) return hit;
  }
  return null;
}

/** Is `maybeDescendantId` inside the subtree rooted at `ancestorId`? */
function isDescendant(nodes: OrgNodeData[], ancestorId: string, maybeDescendantId: string): boolean {
  const ancestor = findNode(nodes, ancestorId);
  if (!ancestor) return false;
  return !!findNode(ancestor.children, maybeDescendantId);
}

/** Detach the subtree at `id`; returns the new forest + the detached node. */
function removeNode(nodes: OrgNodeData[], id: string): { forest: OrgNodeData[]; removed: OrgNodeData | null } {
  let removed: OrgNodeData | null = null;
  const walk = (list: OrgNodeData[]): OrgNodeData[] =>
    list.flatMap((n) => {
      if (n.id === id) {
        removed = n;
        return [];
      }
      return [{ ...n, children: walk(n.children) }];
    });
  const forest = walk(nodes);
  return { forest, removed };
}

/** Append `node` under the parent with `parentId`. Returns null if absent. */
function insertChild(nodes: OrgNodeData[], parentId: string, node: OrgNodeData): OrgNodeData[] | null {
  let inserted = false;
  const walk = (list: OrgNodeData[]): OrgNodeData[] =>
    list.map((n) => {
      if (n.id === parentId) {
        inserted = true;
        return { ...n, children: [...n.children, node] };
      }
      return { ...n, children: walk(n.children) };
    });
  const forest = walk(nodes);
  return inserted ? forest : null;
}

/** One pass to recompute the directReports counts after surgery. */
function recount(nodes: OrgNodeData[]): OrgNodeData[] {
  return nodes.map((n) => ({ ...n, directReports: n.children.length, children: recount(n.children) }));
}

/* ------------------------------------------------------------------ */
/* The tree island                                                     */
/* ------------------------------------------------------------------ */

function NodeCard({
  node,
  dragged,
  hovered,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  node: OrgNodeData;
  dragged: boolean;
  hovered: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex cursor-grab items-center gap-3 rounded-xl border bg-card p-4 shadow-sm${
        dragged ? " opacity-50" : ""
      }${hovered ? " ring-2 ring-inset ring-blue-500/40" : ""}`}
    >
      <Avatar className="h-10 w-10 shrink-0">
        {node.avatarUrl ? <AvatarImage src={node.avatarUrl} alt={node.name} /> : null}
        <AvatarFallback>{initials(node.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{node.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[node.jobTitle, node.department].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
      {node.directReports > 0 ? (
        <span className="ml-auto shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {node.directReports} {node.directReports === 1 ? "report" : "reports"}
        </span>
      ) : null}
    </div>
  );
}

export function OrganogramTree({ trees: serverTrees }: { trees: OrgNodeData[] }) {
  const router = useRouter();
  const toast = useToast();
  // Optimistic state: the local forest IS render order. Re-synced whenever
  // the server refresh lands new props (post-PATCH router.refresh()).
  const [trees, setTrees] = useState<OrgNodeData[]>(serverTrees);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    setTrees(serverTrees);
  }, [serverTrees]);

  async function reparent(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    const draggedNode = findNode(trees, draggedId);
    const targetNode = findNode(trees, targetId);
    if (!draggedNode || !targetNode) return;

    // Client cycle guard — the tree walk precedes any request (the API's
    // ancestor-walk guard is the authoritative second line of defense).
    if (isDescendant(trees, draggedId, targetId)) {
      toast.toast({
        title: "Cannot create a reporting cycle",
        description: `${targetNode.name} already reports up to ${draggedNode.name}.`,
        variant: "error",
      });
      return;
    }

    // Optimistic re-parent: detach, insert under the target, recount.
    const previous = trees;
    const { forest, removed } = removeNode(trees, draggedId);
    if (!removed) return;
    const inserted = insertChild(forest, targetId, removed);
    if (!inserted) return;
    setTrees(recount(inserted));

    try {
      const res = await fetch(`/api/employees?id=${draggedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: targetId }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Move failed", description: json.error?.message, variant: "error" });
        setTrees(previous);
        return;
      }
      toast.toast({
        title: `${draggedNode.name} now reports to ${targetNode.name}`,
        variant: "success",
      });
      // Server is truth: re-read the canonical tree (directReports counts,
      // root ordering) — the island re-syncs from the refreshed props.
      router.refresh();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      setTrees(previous);
    }
  }

  function renderNode(node: OrgNodeData): React.ReactNode {
    return (
      <div key={node.id} className="flex flex-col gap-4">
        <NodeCard
          node={node}
          dragged={draggedId === node.id}
          hovered={dragOverId === node.id && draggedId !== null && draggedId !== node.id}
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", node.id);
            e.dataTransfer.effectAllowed = "move";
            setDraggedId(node.id);
          }}
          onDragEnd={() => {
            setDraggedId(null);
            setDragOverId(null);
          }}
          onDragOver={(e) => {
            if (draggedId === null || draggedId === node.id) return;
            e.preventDefault();
            setDragOverId(node.id);
          }}
          onDragLeave={() => {
            setDragOverId((cur) => (cur === node.id ? null : cur));
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = draggedId ?? e.dataTransfer.getData("text/plain");
            setDraggedId(null);
            setDragOverId(null);
            if (id) void reparent(id, node.id);
          }}
        />
        {node.children.length > 0 ? (
          <div className="ml-6 flex flex-col gap-4 border-l-2 border-border pl-6">
            {node.children.map((child) => renderNode(child))}
          </div>
        ) : null}
      </div>
    );
  }

  return <div className="flex flex-col gap-10 p-8">{trees.map((tree) => renderNode(tree))}</div>;
}
