import { useEffect, useRef, useState } from 'react';
import { classApi, type ClassItem, type ClassStatus } from '../../services/class.service';
import './ClassActionsMenu.css';

interface ClassActionsMenuProps {
  classItem: ClassItem;
  organizationId?: string;
  onAction: (action: string) => void;
}

function ClassActionsMenu({
  classItem,
  organizationId,
  onAction,
}: ClassActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const statusTransitions: Partial<Record<ClassStatus, string[]>> = {
    UPCOMING: ['ACTIVE', 'CANCELLED'],
    ACTIVE: ['COMPLETED', 'CANCELLED'],
  };

  const availableStatuses = statusTransitions[classItem.status] ?? [];

  const handleAction = async (action: string) => {
    if (action === 'duplicate') {
      setWorking(true);
      setError(null);
      try {
        await classApi.duplicate(classItem.id, organizationId);
        onAction('duplicate');
        setOpen(false);
      } catch {
        setError('Nhân bản lớp học thất bại.');
      } finally {
        setWorking(false);
      }
      return;
    }

    setConfirmAction(action);
  };

  const executeConfirm = async () => {
    if (!confirmAction) return;
    setWorking(true);
    setError(null);
    try {
      if (confirmAction === 'cancel') {
        await classApi.update(
          classItem.id,
          { status: 'CANCELLED' },
          organizationId,
        );
        onAction('cancel');
      } else if (confirmAction === 'archive') {
        await classApi.update(
          classItem.id,
          { status: 'COMPLETED' },
          organizationId,
        );
        onAction('archive');
      } else if (confirmAction === 'delete') {
        await classApi.remove(classItem.id, organizationId);
        onAction('delete');
      }
      setOpen(false);
      setConfirmAction(null);
    } catch {
      setError('Thao tác thất bại.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <div className="class-actions-wrap" ref={menuRef}>
        <button
          type="button"
          className="class-kebab"
          aria-label="More actions"
          onClick={() => setOpen((v) => !v)}
        >
          •••
        </button>
        {open && (
          <div className="class-actions-menu">
            <button type="button" onClick={() => { handleAction('duplicate'); }}>
              Duplicate Class
            </button>
            {availableStatuses.includes('COMPLETED') && (
              <button type="button" onClick={() => { handleAction('archive'); }}>
                Archive Class
              </button>
            )}
            {availableStatuses.includes('CANCELLED') && (
              <button type="button" className="class-actions-danger" onClick={() => { handleAction('cancel'); }}>
                Cancel Class
              </button>
            )}
            <div className="class-actions-divider" />
            <button
              type="button"
              className="class-actions-danger"
              onClick={() => { handleAction('delete'); }}
            >
              Delete Class
            </button>
          </div>
        )}
      </div>

      {confirmAction && (
        <div
          className="drawer-backdrop"
          onClick={() => { setConfirmAction(null); setError(null); }}
        >
          <div
            className="class-confirm-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>
              {confirmAction === 'cancel'
                ? 'Cancel this class?'
                : confirmAction === 'archive'
                  ? 'Archive this class?'
                  : 'Delete this class?'}
            </h3>
            <p>
              Are you sure you want to{' '}
              {confirmAction === 'cancel'
                ? 'cancel'
                : confirmAction === 'archive'
                  ? 'archive'
                  : 'permanently delete'}{' '}
              <strong>"{classItem.name}"</strong>?
            </p>
            {confirmAction === 'cancel' && (
              <p className="class-confirm-note">
                This action will mark the class as cancelled.
              </p>
            )}
            {confirmAction === 'archive' && (
              <p className="class-confirm-note">
                This action will mark the class as completed/archived.
              </p>
            )}
            {confirmAction === 'delete' && (
              <p className="class-confirm-note class-confirm-warn">
                This action cannot be undone.
              </p>
            )}
            {error && <div className="drawer-error">{error}</div>}
            <div className="class-confirm-actions">
              <button
                type="button"
                className="drawer-btn drawer-btn-ghost"
                onClick={() => { setConfirmAction(null); setError(null); }}
              >
                {confirmAction === 'delete' ? 'Keep Class' : 'No, Go Back'}
              </button>
              <button
                type="button"
                className={`drawer-btn ${confirmAction === 'delete' ? 'drawer-btn-danger' : 'drawer-btn-primary'}`}
                onClick={executeConfirm}
                disabled={working}
              >
                {working
                  ? 'Processing...'
                  : confirmAction === 'cancel'
                    ? 'Yes, Cancel Class'
                    : confirmAction === 'archive'
                      ? 'Yes, Archive'
                      : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClassActionsMenu;