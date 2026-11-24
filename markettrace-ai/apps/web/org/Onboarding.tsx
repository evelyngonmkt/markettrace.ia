import { useEffect } from 'react';

import { useAuth } from '../auth/AuthContext';
import { Brand } from '../components/ui';
import { CompanyForm } from './CompanyForm';
import { useOrg } from './OrgContext';

export function Onboarding() {
  const { createOrganization } = useOrg();
  const { signOut } = useAuth();

  useEffect(() => {
    document.title = 'Cadastre sua empresa — MarketTrace AI';
  }, []);

  return (
    <div className="center-page">
      <div className="center-card wide">
        <Brand />
        <span className="eyebrow">Primeiro passo</span>
        <h2>Cadastre a sua empresa.</h2>
        <p>
          O workspace é organizado por empresa. Você será o dono e poderá editar estes dados depois.
        </p>
        <CompanyForm submitLabel="Criar empresa e entrar" onSubmit={createOrganization} />
        <button type="button" className="link-button" onClick={() => void signOut()}>
          Sair da conta
        </button>
      </div>
    </div>
  );
}
