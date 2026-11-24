export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';

export type Organization = {
  id: string;
  name: string;
  segment: string | null;
  website: string | null;
  main_goal: string | null;
  created_at: string;
};

export type Membership = { role: OrgRole; organization: Organization };

export type Member = {
  user_id: string;
  role: OrgRole;
  full_name: string | null;
  email: string | null;
};

export type OrganizationInput = {
  name: string;
  segment: string;
  website: string;
  main_goal: string;
};

export const roleLabels: Record<OrgRole, string> = {
  owner: 'Dono(a)',
  admin: 'Administrador(a)',
  member: 'Membro',
  viewer: 'Leitor(a)',
};

/** Quem pode editar os dados da empresa (espelha a regra de RLS do banco). */
export function canEditOrganization(role: OrgRole | undefined): boolean {
  return role === 'owner' || role === 'admin';
}
