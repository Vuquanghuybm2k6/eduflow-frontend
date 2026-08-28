import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import '../App.css';

type FormMode = 'signin' | 'signup';

const GoogleIcon = () => (
  <svg aria-hidden="true" className="google-icon" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.52h3.15c1.84-1.7 2.9-4.2 2.9-7.29Z" />
    <path fill="#34A853" d="M12 21.75c2.62 0 4.82-.87 6.43-2.36L15.28 17a5.78 5.78 0 0 1-8.61-3.03H3.41v2.6A9.72 9.72 0 0 0 12 21.75Z" />
    <path fill="#FBBC05" d="M6.67 13.97a5.85 5.85 0 0 1 0-3.92v-2.6H3.41a9.75 9.75 0 0 0 0 9.12l3.26-2.6Z" />
    <path fill="#EA4335" d="M12 5.13c1.53 0 2.9.53 3.98 1.56l2.99-2.99C16.81 1.68 14.62.5 12 .5a9.72 9.72 0 0 0-8.59 5.18l3.26 2.6A5.78 5.78 0 0 1 12 5.13Z" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    {open ? (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ) : (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.15A10.87 10.87 0 0 1 12 6c6 0 9.5 6 9.5 6a17.5 17.5 0 0 1-3.03 3.61M6.19 6.19C3.86 7.77 2.5 10.1 2.5 12c0 0 3.5 6 9.5 6 1.18 0 2.25-.23 3.2-.61" />
        <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      </>
    )}
  </svg>
);

function AuthPage() {
  const [mode, setMode] = useState<FormMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();
  const isSignUp = mode === 'signup';

  const switchMode = (nextMode: FormMode) => {
    setMode(nextMode);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const form = new FormData(event.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;
    const name = form.get('name') as string;
    const confirmPassword = form.get('confirmPassword') as string;

    if (isSignUp && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      if (isSignUp) {
        await register({ email, password, fullName: name });
        navigate('/');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(Array.isArray(message) ? message[0] : message);
    }
  };

  return (
    <main className="auth-page">
      <aside className="brand-panel">
        <a className="brand" href="/" aria-label="EduFlow home">
          <span className="brand-mark">E</span>EduFlow
        </a>
        <div className="brand-copy">
          <p className="eyebrow">Nền tảng quản lý giáo dục</p>
          <h1>
            Manage education
            <br />
            smarter, together.
          </h1>
          <p>
            Đơn giản hoá công việc hằng ngày để mọi người có thêm thời gian
            cho việc học.
          </p>
        </div>
        <div
          className="dashboard-preview"
          aria-label="Bản xem trước bảng điều khiển"
        >
          <div className="preview-header">
            <span className="preview-logo">E</span>
            <span></span>
            <i></i>
          </div>
          <div className="preview-content">
            <div className="preview-nav">
              <b></b>
              <b></b>
              <b></b>
              <b></b>
            </div>
            <div className="preview-main">
              <small>Tổng quan lớp học</small>
              <div className="stats">
                <span>
                  <strong>1,284</strong>Học viên
                </span>
                <span>
                  <strong>24</strong>Lớp học
                </span>
              </div>
              <div className="chart">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>
          </div>
        </div>
        <p className="brand-footer">© 2026 EduFlow. Learn without limits.</p>
      </aside>

      <section className="form-panel">
        <div className="auth-card">
          <a className="mobile-brand brand" href="/">
            <span className="brand-mark">E</span>EduFlow
          </a>

          <div className="mode-toggle" role="tablist" aria-label="Xác thực">
            <button
              className={!isSignUp ? 'active' : ''}
              onClick={() => switchMode('signin')}
              type="button"
            >
              Đăng nhập
            </button>
            <button
              className={isSignUp ? 'active' : ''}
              onClick={() => switchMode('signup')}
              type="button"
            >
              Đăng ký
            </button>
          </div>

          <header className="form-heading">
            <h2>
              {isSignUp ? 'Tạo tài khoản của bạn' : 'Welcome back 👋'}
            </h2>
            <p>
              {isSignUp
                ? 'Bắt đầu quản lý giáo dục thông minh hơn.'
                : 'Đăng nhập vào tài khoản của bạn'}
            </p>
          </header>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <label>
                Họ và tên
                <input
                  required
                  name="name"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                />
              </label>
            )}

            <label>
              Email
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>

            <label>
              Mật khẩu
              <span className="password-field">
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder={isSignUp ? 'Tối thiểu 6 ký tự' : 'Nhập mật khẩu'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                  }
                >
                  <EyeIcon open={showPassword} />
                </button>
              </span>
            </label>

            {isSignUp && (
              <label>
                Xác nhận mật khẩu
                <input
                  required
                  minLength={6}
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                />
              </label>
            )}

            {!isSignUp && (
              <Link className="forgot-link" to="/forgot-password">
                Quên mật khẩu?
              </Link>
            )}

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="success-message" role="status">
                {success}
              </p>
            )}

            <button
              className="submit-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? 'Đang xử lý...'
                : isSignUp
                  ? 'Tạo tài khoản'
                  : 'Đăng nhập'}
            </button>
          </form>

          <div className="divider">
            <span>hoặc</span>
          </div>
          <button className="google-button" type="button">
            <GoogleIcon />
            Tiếp tục với Google
          </button>
          <p className="switch-copy">
            {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <button
              onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
              type="button"
            >
              {isSignUp ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;