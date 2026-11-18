import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setMessage('Unable to check your session.');
      setSession(data?.session ?? null);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setCheckingSession(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');

    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setMessage('Incorrect email or password.');
        } else if (
          error.message.toLowerCase().includes('email not confirmed')
        ) {
          setMessage('Please verify your email before signing in.');
        } else {
          setMessage('Login failed. Please try again.');
        }
      }
    } catch {
      setMessage('Server error. Please try again later.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setMessage('');

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage('Unable to log out. Please try again.');
    } else {
      setEmail('');
      setPassword('');
    }

    setBusy(false);
  }

  if (checkingSession) {
    return <div className="loading">Checking your session...</div>;
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          background: #10172a;
        }

        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
          background: linear-gradient(135deg,#10172a,#263b65);
        }

        .card {
          width: 100%;
          max-width: 420px;
          padding: 38px;
          border-radius: 20px;
          background: white;
          box-shadow: 0 25px 70px #0005;
        }

        .logo {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #315bea;
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 25px;
        }

        h1 { margin: 0 0 9px; color: #172033; font-size: 28px; }
        .subtitle { color: #788196; margin-bottom: 30px; font-size: 14px; }

        label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin: 18px 0 8px;
          color: #30394b;
        }

        input {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid #dce1eb;
          border-radius: 9px;
          font-size: 14px;
          outline: none;
        }

        input:focus {
          border-color: #315bea;
          box-shadow: 0 0 0 3px #315bea18;
        }

        .password-wrap { position: relative; }
        .password-wrap input { padding-right: 65px; }

        .toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: none;
          color: #315bea;
          cursor: pointer;
          font-size: 12px;
        }

        .primary-button {
          width: 100%;
          padding: 14px;
          margin-top: 25px;
          border: 0;
          border-radius: 9px;
          background: #315bea;
          color: white;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
        }

        .primary-button:hover { background: #2448c5; }
        .primary-button:disabled { opacity: .6; cursor: not-allowed; }

        .message {
          color: #c03939;
          background: #fff0f0;
          padding: 10px;
          border-radius: 7px;
          font-size: 13px;
          margin-top: 14px;
        }

        .footer {
          text-align: center;
          color: #9aa2b1;
          font-size: 12px;
          margin-top: 28px;
        }

        .loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
          color: white;
          background: #10172a;
        }

        .dashboard-card {
          width: 100%;
          max-width: 520px;
          background: white;
          padding: 38px;
          border-radius: 20px;
          box-shadow: 0 25px 70px #0005;
        }

        .status {
          display: inline-block;
          padding: 7px 12px;
          border-radius: 20px;
          color: #167344;
          background: #e5f8ed;
          font-size: 12px;
          margin: 18px 0;
        }

        .user-email {
          color: #667085;
          overflow-wrap: anywhere;
        }

        @media(max-width:480px) {
          .card, .dashboard-card { padding: 27px 22px; }
          h1 { font-size: 25px; }
        }
      `}</style>

      <main className="page">
        {session ? (
          <section className="dashboard-card">
            <div className="logo">N</div>
            <h1>Welcome back!</h1>
            <p className="subtitle">
              You have successfully signed in to Project Nairobi.
            </p>

            <span className="status">● Authenticated</span>

            <p>
              <strong>Account email</strong>
            </p>
            <p className="user-email">{session.user.email}</p>

            <button
              className="primary-button"
              onClick={handleLogout}
              disabled={busy}
            >
              {busy ? 'Logging out...' : 'Logout'}
            </button>

            {message && <p className="message">{message}</p>}
          </section>
        ) : (
          <section className="card">
            <div className="logo">N</div>

            <h1>Welcome back</h1>
            <p className="subtitle">Sign in to your account to continue.</p>

            <form onSubmit={handleLogin}>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />

              <label htmlFor="password">Password</label>
              <div className="password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <button type="submit" className="primary-button" disabled={busy}>
                {busy ? 'Signing in...' : 'Sign in'}
              </button>

              {message && (
                <p className="message" role="alert">
                  {message}
                </p>
              )}
            </form>

            <div className="footer">
              Project Nairobi · Secure Authentication
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default App;
