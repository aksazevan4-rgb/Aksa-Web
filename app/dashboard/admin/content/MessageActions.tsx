"use client";

import { useState, useTransition } from "react";
import { CheckCheck, Inbox, Reply, Trash2 } from "lucide-react";
import { updateMessageStatus, deleteMessage } from "./actions";

export function MessageActions({
  messageId,
  read,
  email,
  subject,
}: {
  messageId: string;
  read: boolean;
  email: string;
  subject: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function setRead(next: boolean) {
    startTransition(() => {
      void updateMessageStatus(messageId, next);
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(() => {
      void deleteMessage(messageId);
    });
  }

  return (
    <div className="flex items-center gap-1 mt-1.5">
      {!read ? (
        <button
          disabled={isPending}
          onClick={() => setRead(true)}
          title="Tandai sudah dibaca"
          className="h-6 w-6 flex items-center justify-center rounded-md text-text-tertiary hover:text-green-400 hover:bg-green-400/10 transition-colors disabled:opacity-50"
        >
          <CheckCheck size={12} />
        </button>
      ) : (
        <button
          disabled={isPending}
          onClick={() => setRead(false)}
          title="Tandai belum dibaca"
          className="h-6 w-6 flex items-center justify-center rounded-md text-text-tertiary hover:text-blue hover:bg-blue/10 transition-colors disabled:opacity-50"
        >
          <Inbox size={12} />
        </button>
      )}
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}`}
        title="Balas via email"
        className="h-6 w-6 flex items-center justify-center rounded-md text-text-tertiary hover:text-purple hover:bg-purple/10 transition-colors"
      >
        <Reply size={12} />
      </a>
      <button
        disabled={isPending}
        onClick={handleDelete}
        onBlur={() => setConfirmDelete(false)}
        title={confirmDelete ? "Klik sekali lagi untuk hapus permanen" : "Hapus"}
        className={`h-6 w-6 flex items-center justify-center rounded-md transition-colors disabled:opacity-50 ${
          confirmDelete
            ? "text-red-400 bg-red-400/10"
            : "text-text-tertiary hover:text-red-400 hover:bg-red-400/10"
        }`}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
