import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/auth.service';
import '../../App.css';

function ResetPasswordPage() {
  const location = useLocation();
  const resetToken = (location.state as { resetToken?: string } | null)
    ?.resetToken;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!resetToken) {
      setError('Phiên đặt lại mật khẩu không hợp lệ. Vui lòng thử lại.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(resetToken, password);
      setMessage('Mật khẩu của bạn đã được đặt lại thành công.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const detail = (err as { response?: { data?: { message?: unknown } } })
        .response?.data?.message;
      const msg =
        typeof detail === 'string' || Array.isArray(detail)
          ? detail
          : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <aside className="brand-panel">
        <a className="brand" href="/" aria-label="EduFlow home">
          <span className="brand-mark">E</span>EduFlow
        </a>
        <div className="brand-copy">
          <p className="eyebrow">Đặt lại mật khẩu</p>
          <h1>
            Tạo mật khẩu
            <br />
            mới.
          </h1>
          <p>Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>
        <p className="brand-footer">© 2026 EduFlow. Học không giới hạn.</p>
      </aside>

      <section className="form-panel">
        <div className="auth-card">
          <a className="mobile-brand brand" href="/">
            <span className="brand-mark">E</span>EduFlow
          </a>

          {!resetToken ? (
            <>
              <header className="form-heading">
                <h2>Phiên không hợp lệ</h2>
                <p>
                  Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng
                  yêu cầu lại mã OTP.
                </p>
              </header>
              <p className="switch-copy">
                <Link to="/forgot-password">Bắt đầu lại</Link>
              </p>
            </>
          ) : (
            <>
              <header className="form-heading">
                <h2>Đặt mật khẩu mới</h2>
                <p>Mật khẩu tối thiểu 6 ký tự.</p>
              </header>

              <form onSubmit={handleSubmit}>
                <label>
                  Mật khẩu mới
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </label>

                <label>
                  Xác nhận mật khẩu mới
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </label>

                {error && (
                  <p className="error-message" role="alert">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="success-message" role="status">
                    {message}
                  </p>
                )}

                <button
                  className="submit-button"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
              </form>

              <p className="switch-copy">
                Nhớ mật khẩu? <Link to="/login">Quay lại đăng nhập</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default ResetPasswordPage;
