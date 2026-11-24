import { useEffect, useState, type FormEvent } from 'react';

import { useAuth } from '../auth/AuthContext';
import { LogOut } from '../components/icons';
import { FormMessage, PageIntro } from '../components/ui';
import { friendlyError, MIN_PASSWORD } from '../lib/messages';
import { supabase } from '../lib/supabase';

export function Account() {
  const { user, signOut, updatePassword } = useAuth();
  const [name, setName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ tone: 'error' | 'info'; text: string } | null>(null);
  const [password, setPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ tone: 'error' | 'info'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    if (!supabase || !userId) return;
    let active = true;
    void supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setName((data as { full_name: string | null } | null)?.full_name ?? '');
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const saveName = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !userId) return;
    setBusy(true);
    setNameMsg(null);
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() === '' ? null : name.trim() })
      .eq('id', userId)
      .select('id');
    setBusy(false);
    if (error) setNameMsg({ tone: 'error', text: friendlyError(error) });
    else if (!data || data.length === 0)
      setNameMsg({ tone: 'error', text: 'Não foi possível salvar o perfil.' });
    else setNameMsg({ tone: 'info', text: 'Nome salvo.' });
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPassMsg(null);
    if (password.length < MIN_PASSWORD) {
      setPassMsg({
        tone: 'error',
        text: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`,
      });
      return;
    }
    setBusy(true);
    const result = await updatePassword(password);
    setBusy(false);
    if (result.error) setPassMsg({ tone: 'error', text: result.error });
    else {
      setPassword('');
      setPassMsg({ tone: 'info', text: 'Senha alterada.' });
    }
  };

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Sistema · 07"
        title="Sua conta e seu acesso."
        description="Atualize seus dados, troque a senha ou saia deste dispositivo."
      />
      <section className="company-grid">
        <div className="surface-card company-card-main">
          <span className="eyebrow">Perfil</span>
          <h3>Seus dados</h3>
          <form onSubmit={(event) => void saveName(event)}>
            <label className="field-label" htmlFor="account-email">
              E-mail
            </label>
            <input
              id="account-email"
              className="field-input"
              value={user?.email ?? ''}
              disabled
              readOnly
            />
            <label className="field-label" htmlFor="account-name">
              Nome
            </label>
            <input
              id="account-name"
              className="field-input"
              maxLength={120}
              disabled={!loaded}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como você quer ser chamado(a)"
            />
            {nameMsg && <FormMessage tone={nameMsg.tone}>{nameMsg.text}</FormMessage>}
            <button className="button button-primary form-submit" disabled={busy || !loaded}>
              Salvar nome
            </button>
          </form>
        </div>
        <div className="surface-card team-card">
          <span className="eyebrow">Segurança</span>
          <h3>Trocar senha</h3>
          <form onSubmit={(event) => void savePassword(event)}>
            <label className="field-label" htmlFor="account-password">
              Nova senha
            </label>
            <input
              id="account-password"
              className="field-input"
              type="password"
              autoComplete="new-password"
              minLength={MIN_PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`Mínimo de ${MIN_PASSWORD} caracteres`}
            />
            {passMsg && <FormMessage tone={passMsg.tone}>{passMsg.text}</FormMessage>}
            <button className="button button-primary form-submit" disabled={busy}>
              Alterar senha
            </button>
          </form>
          <button
            type="button"
            className="button button-quiet sign-out"
            onClick={() => void signOut()}
          >
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </section>
    </div>
  );
}
