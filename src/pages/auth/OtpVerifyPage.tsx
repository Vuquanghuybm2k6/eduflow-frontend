import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/auth.service';
import '../../App.css';

function OtpVerifyPage() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!/^\d{6}$/.test(otp)) {
      setError('OTP phải gồm đúng 6 chữ số');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp(email, otp);
      navigate('/reset-password', { state: { resetToken: res.resetToken } });
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

  const handleResend = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setMessage('Mã OTP mới đã được gửi đến email của bạn.');
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
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
          <p className="eyebrow">Xác nhận OTP</p>
          <h1>
            Xác minh
            <br />
            định danh.
          </h1>
          <p>Nhập mã OTP 6 chữ số đã được gửi đến email của bạn.</p>
        </div>
        <p className="brand-footer">© 2026 EduFlow. Học không giới hạn.</p>
      </aside>

      <section className="form-panel">
        <div className="auth-card">
          <a className="mobile-brand brand" href="/">
            <span className="brand-mark">E</span>EduFlow
          </a>

          <header className="form-heading">
            <h2>Nhập mã xác nhận</h2>
            <p>
              Chúng tôi đã gửi mã OTP đến{' '}
              <strong>{email || 'email của bạn'}</strong>. Mã có hiệu lực trong
              3 phút.
            </p>
          </header>

          <form onSubmit={handleSubmit}>
            <label>
              Mã OTP
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Nhập 6 chữ số"
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
              {isLoading ? 'Đang xác nhận...' : 'Xác nhận mã'}
            </button>
          </form>

          <p className="switch-copy">
            Chưa nhận được mã?{' '}
            <button
              type="button"
              className="link-button"
              onClick={handleResend}
              disabled={isLoading}
            >
              Gửi lại mã
            </button>
          </p>
          <p className="switch-copy">
            <Link to="/forgot-password">Đổi email khác</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default OtpVerifyPage;
