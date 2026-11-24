import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '../auth/AuthContext';
import { friendlyError } from '../lib/messages';
import { supabase } from '../lib/supabase';
import type { Member, Membership, Organization, OrganizationInput, OrgRole } from '../lib/types';

type Result = { error: string | null };

type OrgValue = {
  memberships: Membership[];
  current: Membership | null;
  loading: boolean;
  loadError: string | null;
  select: (id: string) => void;
  refresh: () => Promise<void>;
  createOrganization: (input: OrganizationInput) => Promise<Result>;
  updateOrganization: (id: string, input: OrganizationInput) => Promise<Result>;
  loadMembers: (organizationId: string) => Promise<{ members: Member[]; error: string | null }>;
};

const OrgContext = createContext<OrgValue | null>(null);
const STORAGE_KEY = 'markettrace-ai.current-org';

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* armazenamento indisponível: a escolha vale só nesta sessão */
  }
}

const emptyToNull = (value: string) => (value.trim() === '' ? null : value.trim());

export function OrgProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(readStored);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase || !userId) {
      setMemberships([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('organization_members')
      .select('role, organization:organizations(id, name, segment, website, main_goal, created_at)')
      .eq('user_id', userId);
    if (error) {
      setLoadError(friendlyError(error));
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as unknown as { role: OrgRole; organization: Organization | null }[];
    const list = rows
      .filter(
        (row): row is { role: OrgRole; organization: Organization } => row.organization !== null,
      )
      .map((row) => ({ role: row.role, organization: row.organization }))
      .sort((a, b) => a.organization.name.localeCompare(b.organization.name, 'pt-BR'));
    setMemberships(list);
    setLoadError(null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const current = useMemo(
    () => memberships.find((m) => m.organization.id === currentId) ?? memberships[0] ?? null,
    [memberships, currentId],
  );

  const select = useCallback((id: string) => {
    setCurrentId(id);
    writeStored(id);
  }, []);

  const createOrganization = useCallback(
    async (input: OrganizationInput): Promise<Result> => {
      if (!supabase) return { error: 'O acesso ainda não foi configurado.' };
      const { data, error } = await supabase.rpc('create_organization', {
        p_name: input.name,
        p_segment: emptyToNull(input.segment),
        p_website: emptyToNull(input.website),
        p_main_goal: emptyToNull(input.main_goal),
      });
      if (error) return { error: friendlyError(error) };
      await refresh();
      if (typeof data === 'string') select(data);
      return { error: null };
    },
    [refresh, select],
  );

  const updateOrganization = useCallback(
    async (id: string, input: OrganizationInput): Promise<Result> => {
      if (!supabase) return { error: 'O acesso ainda não foi configurado.' };
      const { data, error } = await supabase
        .from('organizations')
        .update({
          name: input.name.trim(),
          segment: emptyToNull(input.segment),
          website: emptyToNull(input.website),
          main_goal: emptyToNull(input.main_goal),
        })
        .eq('id', id)
        .select('id');
      if (error) return { error: friendlyError(error) };
      if (!data || data.length === 0)
        return { error: 'Você não tem permissão para editar esta empresa.' };
      await refresh();
      return { error: null };
    },
    [refresh],
  );

  const loadMembers = useCallback(async (organizationId: string) => {
    if (!supabase) return { members: [], error: 'O acesso ainda não foi configurado.' };
    const { data: rows, error } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('organization_id', organizationId);
    if (error) return { members: [], error: friendlyError(error) };
    const base = (rows ?? []) as { user_id: string; role: OrgRole }[];
    const ids = base.map((row) => row.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', ids);
    if (profileError) return { members: [], error: friendlyError(profileError) };
    const byId = new Map(
      ((profiles ?? []) as { id: string; full_name: string | null; email: string | null }[]).map(
        (p) => [p.id, p],
      ),
    );
    const order: Record<OrgRole, number> = { owner: 0, admin: 1, member: 2, viewer: 3 };
    const members = base
      .map((row) => ({
        user_id: row.user_id,
        role: row.role,
        full_name: byId.get(row.user_id)?.full_name ?? null,
        email: byId.get(row.user_id)?.email ?? null,
      }))
      .sort((a, b) => order[a.role] - order[b.role]);
    return { members, error: null };
  }, []);

  const value = useMemo<OrgValue>(
    () => ({
      memberships,
      current,
      loading,
      loadError,
      select,
      refresh,
      createOrganization,
      updateOrganization,
      loadMembers,
    }),
    [
      memberships,
      current,
      loading,
      loadError,
      select,
      refresh,
      createOrganization,
      updateOrganization,
      loadMembers,
    ],
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg(): OrgValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg precisa estar dentro de <OrgProvider>');
  return ctx;
}
