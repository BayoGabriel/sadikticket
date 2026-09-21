"use client";
import { useState } from 'react';
import { publishEvent, unpublishEvent, cancelEvent, deleteEvent } from '@/features/admin/events/api';
import { useRouter } from 'next/navigation';

export function EventActions({ eventId, status }: { eventId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const act = async (kind: 'publish' | 'unpublish' | 'cancel' | 'delete') => {
    setError(null);
    try {
      if (kind === 'publish') {
        if (!confirm('Publish event? Your event will be publicly viewable.')) return;
        setLoading('publish');
        await publishEvent(eventId);
      } else if (kind === 'unpublish') {
        if (!confirm('Unpublish event? It will no longer be publicly viewable.')) return;
        setLoading('unpublish');
        await unpublishEvent(eventId);
      } else if (kind === 'cancel') {
        if (!confirm('Cancel this event? This will mark the event as cancelled.')) return;
        setLoading('cancel');
        await cancelEvent(eventId);
      } else if (kind === 'delete') {
        if (!confirm('Delete this event? This action may be irreversible.')) return;
        setLoading('delete');
        await deleteEvent(eventId);
        router.replace('/admin/events');
        return;
      }
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {error && <div className="w-full text-sm text-red-600">{error}</div>}
      {status === 'DRAFT' && (
        <>
          <button disabled={loading==='publish'} onClick={() => act('publish')} className="rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700 disabled:opacity-60">{loading==='publish'?'Publishing…':'Publish'}</button>
          <button disabled={loading==='delete'} onClick={() => act('delete')} className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 text-sm hover:bg-[#F3F3F0] disabled:opacity-60">{loading==='delete'?'Deleting…':'Delete'}</button>
        </>
      )}
      {status === 'PUBLISHED' && (
        <>
          <button disabled={loading==='unpublish'} onClick={() => act('unpublish')} className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 text-sm hover:bg-[#F3F3F0] disabled:opacity-60">{loading==='unpublish'?'Unpublishing…':'Unpublish'}</button>
          <button disabled={loading==='cancel'} onClick={() => act('cancel')} className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 text-sm hover:bg-[#F3F3F0] disabled:opacity-60">{loading==='cancel'?'Cancelling…':'Cancel'}</button>
        </>
      )}
    </div>
  );
}
