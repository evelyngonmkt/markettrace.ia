-- MarketTrace AI · 0001 · Contas, empresas (organizações) e permissões
-- Projeto Supabase PRÓPRIO da MarketTrace AI. Não aplicar no projeto do MarketTrace original.
-- Segurança: RLS em todas as tabelas; o acesso é sempre decidido pela participação na organização.

create type public.org_role as enum ('owner', 'admin', 'member', 'viewer');

-- ---------------------------------------------------------------- tabelas

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) <= 120),
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  segment text check (segment is null or char_length(segment) <= 120),
  website text check (website is null or char_length(website) <= 300),
  main_goal text check (main_goal is null or char_length(main_goal) <= 500),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.org_role not null,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_members_user_idx on public.organization_members (user_id);

create table public.audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_org_idx on public.audit_log (organization_id, created_at desc);

-- ---------------------------------------------------------------- funções auxiliares
-- security definer + search_path vazio: leem a participação sem cair na própria RLS (evita recursão).

create function public.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = auth.uid()
  );
$$;

create function public.has_org_role(org uuid, roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = auth.uid() and m.role = any (roles)
  );
$$;

create function public.shares_org_with(other uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members mine
    join public.organization_members theirs on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid() and theirs.user_id = other
  );
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger organizations_updated before update on public.organizations
  for each row execute function public.set_updated_at();

-- Cria o perfil automaticamente quando alguém se cadastra.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Única porta de entrada para criar uma empresa: cria a organização, o papel de dono e o registro de auditoria.
create function public.create_organization(
  p_name text,
  p_segment text default null,
  p_website text default null,
  p_main_goal text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  new_id uuid;
begin
  if uid is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  insert into public.organizations (name, segment, website, main_goal, created_by)
  values (
    btrim(p_name),
    nullif(btrim(p_segment), ''),
    nullif(btrim(p_website), ''),
    nullif(btrim(p_main_goal), ''),
    uid
  )
  returning id into new_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_id, uid, 'owner');

  insert into public.audit_log (organization_id, actor_id, action, details)
  values (new_id, uid, 'organization.created', jsonb_build_object('name', btrim(p_name)));

  return new_id;
end;
$$;

-- ---------------------------------------------------------------- RLS

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.shares_org_with(id));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy organizations_select on public.organizations
  for select to authenticated
  using (public.is_org_member(id));

create policy organizations_update on public.organizations
  for update to authenticated
  using (public.has_org_role(id, array['owner', 'admin']::public.org_role[]))
  with check (public.has_org_role(id, array['owner', 'admin']::public.org_role[]));

create policy members_select on public.organization_members
  for select to authenticated
  using (public.is_org_member(organization_id));

create policy audit_select on public.audit_log
  for select to authenticated
  using (
    organization_id is not null
    and public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[])
  );

-- ---------------------------------------------------------------- permissões de API
-- Projetos novos do Supabase não liberam tabelas automaticamente: liberamos o mínimo necessário.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant select on public.profiles, public.organizations, public.organization_members, public.audit_log
  to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant update (name, segment, website, main_goal) on public.organizations to authenticated;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, public.org_role[]) to authenticated;
grant execute on function public.shares_org_with(uuid) to authenticated;
grant execute on function public.create_organization(text, text, text, text) to authenticated;
