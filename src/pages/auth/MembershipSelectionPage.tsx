import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import '../../App.css';

function MembershipSelectionPage() {
  const { pendingSelection, selectMembership, cancelSelection, isLoading } =
    useAuthStore();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!pendingSelection) {
    navigate('/login', { replace: true });
    return null;
  }

  const needsPassword = pendingSelection.password === '';

  const handleSelect = async (membershipId: string) => {
    setError('');
    try {
      await selectMembership(membershipId);
      navigate('/dashboard');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const message =
        error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(Array.isArray(message) ? message[0] : message);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (needsPassword && !password.trim()) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }
    handleSelect(pendingSelection.memberships[0].membershipId);
  };

  return (
    <main className="auth-page">
      <aside className="brand-panel">
        <a className="brand" href="/" aria-label="EduFlow home">
          <span className="brand-mark">E</span>EduFlow
        </a>
        <p className="brand-footer">© 2026 EduFlow. Learn without limits.</p>
      </aside>

      <section className="form-panel">
        <div className="auth-card">
          <header className="form-heading">
            <h2>Chọn tổ chức</h2>
            <p>
              Tài khoản của bạn thuộc nhiều tổ chức. Hãy chọn tổ chức để tiếp
              tục.
            </p>
          </header>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {needsPassword && (
            <form onSubmit={handleSubmit}>
              <label>
                Mật khẩu
                <input
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                />
              </label>
              <button
                className="submit-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </form>
          )}

          {!needsPassword && (
            <ul className="org-list">
              {pendingSelection.memberships.map((m) => (
                <li key={m.membershipId}>
                  <button
                    className="org-option"
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelect(m.membershipId)}
                  >
                    <strong>{m.organizationName ?? 'Tổ chức'}</strong>
                    <span>{m.roleName}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            className="cancel-link"
            type="button"
            disabled={isLoading}
            onClick={() => {
              cancelSelection();
              navigate('/login');
            }}
          >
            Quay lại đăng nhập
          </button>
        </div>
      </section>
    </main>
  );
}

export default MembershipSelectionPage;
