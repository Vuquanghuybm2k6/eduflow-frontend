import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth.service';
import '../App.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      navigate('/verify-otp', { state: { email } });
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
          <p className="eyebrow">Khôi phục tài khoản</p>
          <h1>
            Reset your
            <br />
            password easily.
          </h1>
          <p>
            Chúng tôi sẽ gửi cho bạn một mã OTP để xác nhận qua email.
          </p>
        </div>
        <p className="brand-footer">© 2026 EduFlow. Learn without limits.</p>
      </aside>

      <section className="form-panel">
        <div className="auth-card">
          <a className="mobile-brand brand" href="/">
            <span className="brand-mark">E</span>EduFlow
          </a>

          <header className="form-heading">
            <h2>Quên mật khẩu?</h2>
            <p>Nhập email của bạn để nhận mã OTP xác nhận.</p>
          </header>

          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <button
              className="submit-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            </button>
          </form>

          <p className="switch-copy">
            Nhớ mật khẩu? <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
