import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { Plus, Users } from '../components/icons';
import { EmptyState, FormMessage, PageIntro, StatusPill } from '../components/ui';
import { canEditOrganization, roleLabels, type Member } from '../lib/types';
import { CompanyForm } from '../org/CompanyForm';
import { useOrg } from '../org/OrgContext';

export function Company() {
  const { current, updateOrganization, loadMembers } = useOrg();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const orgId = current?.organization.id;

  useEffect(() => {
    if (!orgId) return;
    let active = true;
    setMembers(null);
    void loadMembers(orgId).then((result) => {
      if (!active) return;
      setMembers(result.members);
      setError(result.error);
    });
    return () => {
      active = false;
    };
  }, [orgId, loadMembers]);

  if (!current) return null;
  const { organization, role } = current;
  const editable = canEditOrganization(role);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Workspace · 06"
        title="Uma inteligência feita em conjunto."
        description="Os dados da empresa e as pessoas que têm acesso a este workspace."
        action={
          <NavLink className="button button-quiet" to="/company/new">
            <Plus size={16} /> Nova empresa
          </NavLink>
        }
      />
      <section className="company-grid">
        <div className="surface-card company-card-main">
          <div className="company-profile-mark">{organization.name.charAt(0).toUpperCase()}</div>
          <span className="eyebrow">Workspace atual</span>
          <h2>{organization.name}</h2>
          <p>
            {editable
              ? 'Edite os dados da empresa abaixo.'
              : 'Você tem acesso de leitura. Só dono(a) e administradores editam estes dados.'}
          </p>
          <CompanyForm
            key={organization.id + organization.name}
            initial={{
              name: organization.name,
              segment: organization.segment ?? '',
              website: organization.website ?? '',
              main_goal: organization.main_goal ?? '',
            }}
            readOnly={!editable}
            submitLabel="Salvar alterações"
            onSubmit={(value) => updateOrganization(organization.id, value)}
          />
        </div>
        <div className="surface-card team-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Equipe</span>
              <h3>Quem pensa com você.</h3>
            </div>
            <Users size={19} />
          </div>
          {error && <FormMessage tone="error">{error}</FormMessage>}
          {members === null && !error && <p className="muted-line">Carregando equipe…</p>}
          {members !== null && members.length === 0 && (
            <EmptyState
              icon={Users}
              eyebrow="Nenhum membro"
              title="Nenhuma pessoa encontrada"
              description="Algo está inconsistente: o workspace deveria ter ao menos o dono."
            />
          )}
          {members !== null && members.length > 0 && (
            <ul className="member-list">
              {members.map((member) => (
                <li className="member-row" key={member.user_id}>
                  <span className="profile-avatar">
                    {(member.full_name ?? member.email ?? '?').charAt(0).toUpperCase()}
                  </span>
                  <span className="member-meta">
                    <strong>{member.full_name ?? 'Sem nome'}</strong>
                    <small>{member.email ?? ''}</small>
                  </span>
                  <StatusPill tone={member.role === 'owner' ? 'violet' : 'neutral'}>
                    {roleLabels[member.role]}
                  </StatusPill>
                </li>
              ))}
            </ul>
          )}
          <p className="muted-line">Convites por e-mail chegam na próxima etapa.</p>
        </div>
      </section>
    </div>
  );
}

export function NewCompany() {
  const { createOrganization } = useOrg();
  const navigate = useNavigate();

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Workspace · 06"
        title="Cadastre uma nova empresa."
        description="Cada empresa tem os próprios dados, isolados das demais. Você será o dono da nova empresa."
      />
      <section className="surface-card company-card-main">
        <CompanyForm
          submitLabel="Criar empresa"
          onSubmit={async (value) => {
            const result = await createOrganization(value);
            if (!result.error) navigate('/company');
            return result;
          }}
        />
      </section>
    </div>
  );
}
