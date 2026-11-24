import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { Brand, Splash } from '../components/ui';
import { isSupabaseConfigured } from '../lib/supabase';
import { useOrg } from '../org/OrgContext';
import { Onboarding } from '../org/Onboarding';
import { useAuth } from './AuthContext';

/** Barra quem não tem sessão e avisa, sem simular nada, quando o ambiente não está configurado. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return (
      <div className="center-page">
        <div className="center-card">
          <Brand />
          <h2>Ambiente sem configuração.</h2>
          <p>
            Faltam as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>{' '}
            neste deploy. Cadastre-as nas configurações do projeto e publique de novo.
          </p>
        </div>
      </div>
    );
  }
  if (loading) return <Splash label="Verificando sua sessão" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/** Quem ainda não tem empresa cria a primeira antes de entrar no produto. */
export function RequireOrganization({ children }: { children: ReactNode }) {
  const { memberships, loading, loadError, refresh } = useOrg();

  if (loading && memberships.length === 0) return <Splash label="Carregando seu workspace" />;
  if (loadError && memberships.length === 0) {
    return (
      <div className="center-page">
        <div className="center-card">
          <Brand />
          <h2>Não foi possível carregar seu workspace.</h2>
          <p>{loadError}</p>
          <button className="button button-primary" onClick={() => void refresh()}>
            Tentar de novo
          </button>
        </div>
      </div>
    );
  }
  if (memberships.length === 0) return <Onboarding />;
  return <>{children}</>;
}
