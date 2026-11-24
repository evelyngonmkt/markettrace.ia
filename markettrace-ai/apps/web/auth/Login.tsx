import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { ArrowRight, LockKeyhole, Sparkles } from '../components/icons';
import { Brand, FormMessage, Splash } from '../components/ui';
import { MIN_PASSWORD } from '../lib/messages';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

type Mode = 'entrar' | 'cadastrar' | 'recuperar';

const copy: Record<Mode, { eyebrow: string; title: string; text: string; button: string }> = {
  entrar: {
    eyebrow: 'Acesso ao workspace',
    title: 'Entre para continuar.',
    text: 'Use o e-mail e a senha da sua conta.',
    button: 'Entrar no workspace',
  },
  cadastrar: {
    eyebrow: 'Nova conta',
    title: 'Crie sua conta.',
    text: 'Em seguida você cadastra a sua empresa e começa a usar.',
    button: 'Criar conta',
  },
  recuperar: {
    eyebrow: 'Recuperar acesso',
    title: 'Redefina sua senha.',
    text: 'Enviaremos um link para o seu e-mail.',
    button: 'Enviar link',
  },
};

export function Login() {
  const { user, loading, signIn, signUp, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [mode, setMode] = useState<Mode>('entrar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Entrar — MarketTrace AI';
  }, []);

  if (loading) return <Splash label="Verificando sua sessão" />;
  if (user) return <Navigate to={from} replace />;

  const change = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (mode !== 'recuperar' && password.length < MIN_PASSWORD) {
      setError(`A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    setBusy(true);
    if (mode === 'entrar') {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
      else navigate(from, { replace: true });
    } else if (mode === 'cadastrar') {
      const result = await signUp(email, password, name);
      if (result.error) setError(result.error);
      else if (result.needsConfirmation)
        setInfo(
          `Enviamos um link de confirmação para ${email.trim()}. Abra o e-mail e depois entre.`,
        );
      else navigate('/', { replace: true });
    } else {
      const result = await sendPasswordReset(email);
      if (result.error) setError(result.error);
      else setInfo('Se este e-mail tiver cadastro, o link de redefinição já está a caminho.');
    }
    setBusy(false);
  };

  const text = copy[mode];

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-grid" />
        <Brand />
        <div className="login-visual-copy">
          <span className="eyebrow">Inteligência para quem decide</span>
          <h1>
            O mercado muda.
            <br />
            <span>Seu contexto também importa.</span>
          </h1>
          <p>MarketTrace AI aproxima evidência, contexto e ação em uma experiência única.</p>
          <div className="login-visual-note">
            <Sparkles size={16} />
            <span>Os dados de cada empresa ficam isolados</span>
          </div>
        </div>
        <div className="login-visual-footer">
          <span>MARKETTRACE AI</span>
          <span>Estratégia com rastreabilidade</span>
        </div>
      </div>
      <div className="login-panel">
        <div className="login-card">
          <div className="login-card-icon">
            <LockKeyhole size={19} />
          </div>
          <span className="eyebrow">{text.eyebrow}</span>
          <h2>{text.title}</h2>
          <p>{text.text}</p>
          {!isSupabaseConfigured && (
            <FormMessage tone="error">
              O acesso ainda não foi configurado neste ambiente (variáveis do Supabase ausentes).
            </FormMessage>
          )}
          <form onSubmit={(event) => void submit(event)} noValidate={false}>
            {mode === 'cadastrar' && (
              <>
                <label className="field-label" htmlFor="name">
                  Seu nome
                </label>
                <input
                  id="name"
                  className="field-input"
                  autoComplete="name"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como você quer ser chamado(a)"
                />
              </>
            )}
            <label className="field-label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              className="field-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@empresa.com"
            />
            {mode !== 'recuperar' && (
              <>
                <label className="field-label" htmlFor="password">
                  Senha
                </label>
                <input
                  id="password"
                  className="field-input"
                  type="password"
                  autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
                  required
                  minLength={MIN_PASSWORD}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === 'cadastrar' ? `Mínimo de ${MIN_PASSWORD} caracteres` : 'Sua senha'
                  }
                />
              </>
            )}
            {error && <FormMessage tone="error">{error}</FormMessage>}
            {info && <FormMessage tone="info">{info}</FormMessage>}
            <button
              className="button button-primary login-submit"
              disabled={busy || !isSupabaseConfigured}
            >
              {busy ? 'Aguarde…' : text.button} <ArrowRight size={16} />
            </button>
          </form>
          <div className="auth-switch">
            {mode === 'entrar' && (
              <>
                <button type="button" className="link-button" onClick={() => change('cadastrar')}>
                  Criar conta
                </button>
                <button type="button" className="link-button" onClick={() => change('recuperar')}>
                  Esqueci minha senha
                </button>
              </>
            )}
            {mode !== 'entrar' && (
              <button type="button" className="link-button" onClick={() => change('entrar')}>
                Já tenho conta · Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
