import { useEffect, useRef, useState } from 'react';
import {
  classApi,
  type ClassItem,
} from '../../services/class.service';
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

  const canCancel =
    classItem.lifecycleStatus === 'UPCOMING' ||
    classItem.lifecycleStatus === 'ONGOING';
  const canDeactivate = classItem.status === 'ACTIVE';
  const canReactivate = classItem.status === 'INACTIVE';

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
        await classApi.remove(classItem.id, organizationId);
        onAction('cancel');
      } else if (confirmAction === 'deactivate') {
        await classApi.update(
          classItem.id,
          { status: 'INACTIVE' },
          organizationId,
        );
        onAction('deactivate');
      } else if (confirmAction === 'reactivate') {
        await classApi.update(
          classItem.id,
          { status: 'ACTIVE' },
          organizationId,
        );
        onAction('reactivate');
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
          aria-label="Thêm thao tác"
          onClick={() => setOpen((v) => !v)}
        >
          •••
        </button>
        {open && (
          <div className="class-actions-menu">
            <button type="button" onClick={() => { handleAction('duplicate'); }}>
              Nhân bản lớp
            </button>
            {canDeactivate && (
              <button type="button" onClick={() => { handleAction('deactivate'); }}>
                Ngừng hoạt động
              </button>
            )}
            {canReactivate && (
              <button type="button" onClick={() => { handleAction('reactivate'); }}>
                Kích hoạt lại
              </button>
            )}
            {canCancel && (
              <button type="button" className="class-actions-danger" onClick={() => { handleAction('cancel'); }}>
                Hủy lớp
              </button>
            )}
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
                ? 'Hủy lớp này?'
                : confirmAction === 'deactivate'
                  ? 'Ngừng hoạt động lớp này?'
                  : 'Kích hoạt lại lớp này?'}
            </h3>
            <p>
              Bạn có chắc muốn{' '}
              {confirmAction === 'cancel'
                ? 'hủy'
                : confirmAction === 'deactivate'
                  ? 'ngừng hoạt động'
                  : 'kích hoạt lại'}{' '}
              <strong>"{classItem.name}"</strong>?
            </p>
            {confirmAction === 'cancel' && (
              <p className="class-confirm-note">
                Hành động này sẽ đánh dấu lớp là đã hủy.
              </p>
            )}
            {confirmAction === 'deactivate' && (
              <p className="class-confirm-note">
                Lớp sẽ không còn được sử dụng trong hệ thống, nhưng lịch sử vẫn được giữ lại.
              </p>
            )}
            {confirmAction === 'reactivate' && (
              <p className="class-confirm-note">
                Lớp sẽ được sử dụng lại trong hệ thống.
              </p>
            )}
            {error && <div className="drawer-error">{error}</div>}
            <div className="class-confirm-actions">
              <button
                type="button"
                className="drawer-btn drawer-btn-ghost"
                onClick={() => { setConfirmAction(null); setError(null); }}
              >
                Không, quay lại
              </button>
              <button
                type="button"
                className={`drawer-btn ${confirmAction === 'cancel' ? 'drawer-btn-danger' : 'drawer-btn-primary'}`}
                onClick={executeConfirm}
                disabled={working}
              >
                {working
                  ? 'Đang xử lý...'
                  : confirmAction === 'cancel'
                    ? 'Có, hủy lớp'
                    : confirmAction === 'deactivate'
                      ? 'Có, ngừng hoạt động'
                      : 'Có, kích hoạt lại'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClassActionsMenu;