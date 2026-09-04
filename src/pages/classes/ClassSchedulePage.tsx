import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { classApi, type ClassItem } from '../../services/class.service';
import { teachersApi, type Teacher } from '../../services/teachers.service';
import {
  schedulesApi,
  readScheduleError,
  DAYS_OF_WEEK,
  DAY_LABELS,
  DAY_SHORT_LABELS,
  type DayOfWeek,
  type Schedule,
  type ScheduleErrorInfo,
} from '../../services/schedules.service';
import DashboardLayout from '../../layouts/DashboardLayout';
import './ClassesPage.css';
import './ClassDetailPage.css';
import './ClassSchedulePage.css';

interface DraftSession {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

const createEmptyDraft = (): DraftSession => ({
  dayOfWeek: 'MONDAY',
  startTime: '',
  endTime: '',
});

interface EditValues {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

function DayPicker({
  value,
  onChange,
}: {
  value: DayOfWeek;
  onChange: (day: DayOfWeek) => void;
}) {
  return (
    <div className="schedule-day-picker" role="group" aria-label="Chọn ngày">
      {DAYS_OF_WEEK.map((day) => (
        <button
          key={day}
          type="button"
          className={`schedule-day-btn${value === day ? ' is-active' : ''}`}
          onClick={() => onChange(day)}
          aria-pressed={value === day}
        >
          {DAY_SHORT_LABELS[day]}
        </button>
      ))}
    </div>
  );
}

/** "Thứ hai · 18:00–20:00" style preview line for a single session. */
function PreviewList({
  sessions,
  emptyText,
}: {
  sessions: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }[];
  emptyText: string;
}) {
  const valid = sessions.filter(
    (s) => s.startTime && s.endTime && s.endTime > s.startTime,
  );
  if (valid.length === 0) {
    return <div className="schedule-preview-empty">{emptyText}</div>;
  }
  return (
    <ul className="schedule-preview-list">
      {valid.map((s, i) => (
        <li key={i} className="schedule-preview-item">
          <span className="schedule-preview-day">
            {DAY_SHORT_LABELS[s.dayOfWeek]}
          </span>
          <span className="schedule-preview-dot" />
          <span className="schedule-preview-time">
            {s.startTime} – {s.endTime}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ClassSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;
  const navigate = useNavigate();

  const [classItem, setClassItem] = useState<ClassItem | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftSession[]>([]);
  const [formError, setFormError] = useState<ScheduleErrorInfo | null>(null);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Schedule | null>(null);
  const [editValues, setEditValues] = useState<EditValues>({
    dayOfWeek: 'MONDAY',
    startTime: '',
    endTime: '',
  });
  const [editError, setEditError] = useState<ScheduleErrorInfo | null>(null);

  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(
    null,
  );

  const loadSchedules = useCallback(async () => {
    if (!id) return;
    setSchedulesLoading(true);
    try {
      const list = await schedulesApi.findByClass(id, organizationId);
      setSchedules(list);
      setError(null);
    } catch {
      setError('Không thể tải lịch học của lớp.');
    } finally {
      setSchedulesLoading(false);
    }
  }, [id, organizationId]);

  useEffect(() => {
    let active = true;
    if (!id) return;
    (async () => {
      try {
        const [c] = await Promise.all([classApi.findOne(id, organizationId)]);
        if (active) {
          setClassItem(c);
          if (c.teacherId) {
            const list = await teachersApi.findAll(organizationId);
            setTeacher(list.find((t) => t.id === c.teacherId) ?? null);
          } else {
            setTeacher(null);
          }
          setError(null);
        }
      } catch {
        if (active) setError('Không thể tải thông tin lớp học.');
      } finally {
        if (active) setLoading(false);
      }
      void loadSchedules();
    })();
    return () => {
      active = false;
    };
  }, [id, organizationId, loadSchedules]);

  const openAdd = () => {
    setFormError(null);
    setDrafts([createEmptyDraft()]);
    setAddOpen(true);
  };

  const updateDraft = (
    index: number,
    patch: Partial<DraftSession>,
  ) => {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
  };

  const addDraft = () => {
    setDrafts((prev) => {
      const last = prev[prev.length - 1];
      const next: DraftSession = last
        ? {
            dayOfWeek: last.dayOfWeek,
            startTime: last.startTime,
            endTime: last.endTime,
          }
        : createEmptyDraft();
      return [...prev, next];
    });
  };
  const removeDraft = (index: number) =>
    setDrafts((prev) => prev.filter((_, i) => i !== index));

  const openEdit = (schedule: Schedule) => {
    setEditError(null);
    setEditing(schedule);
    setEditValues({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
  };

  const handleBulkSubmit = async () => {
    if (!id) return;
    const sessions = drafts
      .filter((d) => d.startTime || d.endTime)
      .map((d) => ({ ...d }));

    if (sessions.length === 0) {
      setFormError({ message: 'Vui lòng thêm ít nhất một buổi học.' });
      return;
    }
    for (const s of sessions) {
      if (!s.startTime || !s.endTime) {
        setFormError({
          message: `Vui lòng điền đầy đủ thời gian cho buổi ${DAY_SHORT_LABELS[s.dayOfWeek]}.`,
        });
        return;
      }
      if (s.endTime <= s.startTime) {
        setFormError({
          message: `Buổi ${DAY_SHORT_LABELS[s.dayOfWeek]}: giờ kết thúc phải lớn hơn giờ bắt đầu.`,
        });
        return;
      }
    }

    setSaving(true);
    setFormError(null);
    try {
      await schedulesApi.createBulk(id, { sessions }, organizationId);
      setAddOpen(false);
      await loadSchedules();
    } catch (err) {
      setFormError(readScheduleError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editing) return;
    const { dayOfWeek, startTime, endTime } = editValues;
    if (!startTime || !endTime) {
      setEditError({ message: 'Vui lòng điền đầy đủ thời gian học.' });
      return;
    }
    if (endTime <= startTime) {
      setEditError({ message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.' });
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      await schedulesApi.update(
        editing.id,
        { dayOfWeek, startTime, endTime },
        organizationId,
      );
      setEditing(null);
      await loadSchedules();
    } catch (err) {
      setEditError(readScheduleError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingScheduleId) return;
    setSaving(true);
    try {
      await schedulesApi.remove(deletingScheduleId, organizationId);
      setDeletingScheduleId(null);
      await loadSchedules();
    } catch {
      setError('Không thể xóa lịch học.');
      setDeletingScheduleId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout activeLabel="Classes">
      <div className="dashboard-content class-schedule-content">
        <button
          type="button"
          className="class-back"
          onClick={() =>
            navigate(
              `/classes/${id}${organizationId ? `?organizationId=${organizationId}` : ''}`,
            )
          }
        >
          ← Quay lại lớp học
        </button>

        {error && <div className="class-detail-error">{error}</div>}
        {loading && !classItem && !error && (
          <div className="class-detail-loading">Đang tải...</div>
        )}

        {!loading && classItem && (
          <>
            <div className="class-schedule-hero">
              <div className="class-schedule-hero-main">
                <h1>{classItem.name}</h1>
                <p className="class-schedule-hero-sub">
                  {classItem.code}
                  {teacher?.user?.fullName
                    ? ` · Giáo viên: ${teacher.user.fullName}`
                    : ''}
                </p>
              </div>
              <button
                type="button"
                className="classes-add-small"
                onClick={openAdd}
              >
                + Thêm lịch học
              </button>
            </div>

            <section className="class-schedule-panel">
              <div className="class-schedule-head">
                <div>
                  <h2>Lịch học</h2>
                  <p className="class-schedule-subtitle">
                    Lịch học hàng tuần của lớp
                  </p>
                </div>
              </div>

              {schedulesLoading ? (
                <div className="classes-enroll-loading">Đang tải lịch học...</div>
              ) : schedules.length === 0 ? (
                <div className="classes-enroll-empty">
                  Chưa có lịch học nào được thêm cho lớp này.
                </div>
              ) : (
                <div className="class-table-wrap">
                  <table className="class-table">
                    <thead>
                      <tr>
                        <th>Thứ</th>
                        <th>Thời gian</th>
                        <th className="class-table-action">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <span className="class-day-badge">
                              {DAY_LABELS[s.dayOfWeek]}
                            </span>
                          </td>
                          <td>
                            <span className="class-time-range">
                              {s.startTime} — {s.endTime}
                            </span>
                          </td>
                          <td className="class-table-action">
                            <div className="class-schedule-actions">
                              <button
                                type="button"
                                className="class-row-menu class-schedule-action-btn"
                                aria-label="Sửa lịch học"
                                onClick={() => openEdit(s)}
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                className="class-row-menu class-row-menu-danger class-schedule-action-btn"
                                aria-label="Xóa lịch học"
                                onClick={() => setDeletingScheduleId(s.id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {addOpen && (
          <div
            className="classes-modal-backdrop"
            onClick={() => setAddOpen(false)}
          >
            <div
              className="classes-modal classes-schedule-modal schedule-add-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="classes-modal-header">
                <div>
                  <h3>Thêm lịch học</h3>
                  <p className="schedule-modal-sub">
                    Thêm một hoặc nhiều buổi học mỗi tuần
                  </p>
                </div>
                <button
                  type="button"
                  className="classes-modal-close"
                  onClick={() => setAddOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="schedule-sessions">
                {drafts.map((draft, index) => (
                  <div className="schedule-session-row" key={index}>
                    <div className="schedule-session-head">
                      <span className="schedule-session-label">
                        Buổi {index + 1}
                      </span>
                      {drafts.length > 1 && (
                        <button
                          type="button"
                          className="schedule-row-remove"
                          aria-label={`Xóa buổi ${DAY_SHORT_LABELS[draft.dayOfWeek]}`}
                          onClick={() => removeDraft(index)}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                    <DayPicker
                      value={draft.dayOfWeek}
                      onChange={(day) => updateDraft(index, { dayOfWeek: day })}
                    />
                    <div className="schedule-session-time">
                      <input
                        type="time"
                        value={draft.startTime}
                        onChange={(e) =>
                          updateDraft(index, { startTime: e.target.value })
                        }
                        aria-label={`Giờ bắt đầu buổi ${DAY_SHORT_LABELS[draft.dayOfWeek]}`}
                      />
                      <span className="schedule-time-sep">–</span>
                      <input
                        type="time"
                        value={draft.endTime}
                        onChange={(e) =>
                          updateDraft(index, { endTime: e.target.value })
                        }
                        aria-label={`Giờ kết thúc buổi ${DAY_SHORT_LABELS[draft.dayOfWeek]}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="schedule-add-another"
                onClick={addDraft}
              >
                + Thêm buổi học khác
              </button>

              {formError && (
                <div
                  className={`schedule-error${formError.details ? ' is-warning' : ''}`}
                  role="alert"
                >
                  {formError.details && (
                    <strong>⚠ Xung đột lịch học</strong>
                  )}
                  <span>{formError.message}</span>
                </div>
              )}

              <div className="schedule-preview">
                <p className="schedule-preview-title">Xem trước lịch học</p>
                <PreviewList
                  sessions={drafts}
                  emptyText="Chọn ngày và giờ để xem trước lịch học."
                />
              </div>

              <div className="classes-modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setAddOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleBulkSubmit}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu lịch học'}
                </button>
              </div>
            </div>
          </div>
        )}

        {editing && (
          <div
            className="classes-modal-backdrop"
            onClick={() => setEditing(null)}
          >
            <div
              className="classes-modal classes-schedule-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="classes-modal-header">
                <h3>Sửa lịch học</h3>
                <button
                  type="button"
                  className="classes-modal-close"
                  onClick={() => setEditing(null)}
                >
                  ✕
                </button>
              </div>

              <div className="classes-field-grid">
                <span className="classes-field-label">Thứ</span>
                <DayPicker
                  value={editValues.dayOfWeek}
                  onChange={(day) =>
                    setEditValues((prev) => ({ ...prev, dayOfWeek: day }))
                  }
                />
              </div>

              <div className="classes-field-grid">
                <span className="classes-field-label">Thời gian</span>
                <div className="schedule-session-time schedule-edit-time">
                  <input
                    type="time"
                    value={editValues.startTime}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    aria-label="Giờ bắt đầu"
                  />
                  <span className="schedule-time-sep">–</span>
                  <input
                    type="time"
                    value={editValues.endTime}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    aria-label="Giờ kết thúc"
                  />
                </div>
              </div>

              {editError && (
                <div
                  className={`schedule-error${editError.details ? ' is-warning' : ''}`}
                  role="alert"
                >
                  {editError.details && <strong>⚠ Xung đột lịch học</strong>}
                  <span>{editError.message}</span>
                </div>
              )}

              <div className="schedule-preview">
                <p className="schedule-preview-title">Xem trước lịch học</p>
                <PreviewList
                  sessions={[editValues]}
                  emptyText="Chọn ngày và giờ để xem trước lịch học."
                />
              </div>

              <div className="classes-modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setEditing(null)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleEditSubmit}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingScheduleId && (
          <div
            className="classes-modal-backdrop"
            onClick={() => setDeletingScheduleId(null)}
          >
            <div
              className="classes-modal classes-confirm-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="classes-modal-header">
                <h3>Xóa lịch học</h3>
                <button
                  type="button"
                  className="classes-modal-close"
                  onClick={() => setDeletingScheduleId(null)}
                >
                  ✕
                </button>
              </div>
              <p className="classes-confirm-text">
                Bạn có chắc chắn muốn xóa buổi học này không?
              </p>
              <div className="classes-modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setDeletingScheduleId(null)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  {saving ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ClassSchedulePage;
