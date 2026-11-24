import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { Brand, FormMessage, Splash } from '../components/ui';
import { MIN_PASSWORD } from '../lib/messages';
import { useAuth } from './AuthContext';

export function ResetPassword() {
  const { session, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Nova senha — MarketTrace AI';
  }, []);

  if (loading) return <Splash label="Validando o link" />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    setBusy(true);
    const result = await updatePassword(password);
    setBusy(false);
    if (result.error) setError(result.error);
    else navigate('/', { replace: true });
  };

  return (
    <div className="center-page">
      <div className="center-card">
        <Brand />
        {session ? (
          <form onSubmit={(event) => void submit(event)}>
            <h2>Crie uma nova senha.</h2>
            <label className="field-label" htmlFor="new-password">
              Nova senha
            </label>
            <input
              id="new-password"
              className="field-input"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`Mínimo de ${MIN_PASSWORD} caracteres`}
            />
            {error && <FormMessage tone="error">{error}</FormMessage>}
            <button className="button button-primary login-submit" disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        ) : (
          <>
            <h2>Link inválido ou expirado.</h2>
            <p>Peça um novo link de redefinição na tela de entrada.</p>
            <NavLink className="button button-primary" to="/login">
              Ir para a entrada
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
}
