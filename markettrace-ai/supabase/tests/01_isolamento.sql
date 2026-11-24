-- Teste de isolamento entre empresas. Roda numa transação e termina com ROLLBACK (não deixa dados).
-- Local: psql -v ON_ERROR_STOP=1 -f tests/00_local_auth_stub.sql -f migrations/0001_contas_empresas.sql -f tests/01_isolamento.sql
begin;

create temp table ctx (k text primary key, v uuid);
grant all on ctx to anon, authenticated;

-- três pessoas: A e B donas de empresas diferentes, C leitora da empresa de A
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@teste.com', '{"full_name":"Ana"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@teste.com', '{"full_name":"Beto"}'),
  ('00000000-0000-0000-0000-00000000000c', 'c@teste.com', '{"full_name":"Carla"}');

do $$ begin
  assert (select count(*) from public.profiles) = 3, 'o cadastro deveria criar 3 perfis';
end $$;

set local role authenticated;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', true);
insert into ctx select 'orgA', public.create_organization('Empresa A', 'Varejo', 'https://a.com', 'Crescer');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', true);
insert into ctx select 'orgB', public.create_organization('Empresa B');

-- C entra como leitora da Empresa A (feito pelo administrador do banco, pois ainda não há convites)
reset role;
insert into public.organization_members (organization_id, user_id, role)
select v, '00000000-0000-0000-0000-00000000000c', 'viewer' from ctx where k = 'orgA';
set local role authenticated;

-- 1) A enxerga só a própria empresa
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', true);
do $$ declare b uuid := (select v from ctx where k = 'orgB'); begin
  assert (select count(*) from public.organizations) = 1, 'A deveria ver 1 empresa';
  assert (select name from public.organizations) = 'Empresa A', 'A deveria ver a Empresa A';
  assert (select count(*) from public.organizations where id = b) = 0, 'A não pode ver a Empresa B';
  assert (select count(*) from public.organization_members where organization_id = b) = 0, 'A não pode ver membros da B';
  assert (select count(*) from public.profiles where id = '00000000-0000-0000-0000-00000000000b') = 0, 'A não pode ver o perfil de B';
  assert (select count(*) from public.audit_log where organization_id = b) = 0, 'A não pode ver a auditoria da B';
  assert (select count(*) from public.audit_log) = 1, 'A deveria ver a própria auditoria';
  assert (select count(*) from public.profiles) = 2, 'A deveria ver os perfis de A e de C (mesma empresa)';
end $$;

-- 2) A não consegue alterar a empresa de B (RLS filtra: 0 linhas)
do $$ declare n int; b uuid := (select v from ctx where k = 'orgB'); begin
  update public.organizations set name = 'Invadida' where id = b;
  get diagnostics n = row_count;
  assert n = 0, 'A não pode alterar a Empresa B';
end $$;

-- 3) A altera a própria empresa
do $$ declare n int; a uuid := (select v from ctx where k = 'orgA'); begin
  update public.organizations set name = 'Empresa A Nova', segment = 'Moda' where id = a;
  get diagnostics n = row_count;
  assert n = 1, 'A deveria poder alterar a própria empresa';
end $$;

-- 4) Escritas diretas proibidas: criar empresa, entrar em empresa alheia, mudar dono, mudar id do perfil
do $$ declare b uuid := (select v from ctx where k = 'orgB'); begin
  begin
    insert into public.organizations (name, created_by) values ('Direta', '00000000-0000-0000-0000-00000000000a');
    assert false, 'insert direto em organizations deveria falhar';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.organization_members (organization_id, user_id, role)
    values (b, '00000000-0000-0000-0000-00000000000a', 'owner');
    assert false, 'A não pode se adicionar como dono da Empresa B';
  exception when insufficient_privilege then null; end;
  begin
    update public.organizations set created_by = '00000000-0000-0000-0000-00000000000b';
    assert false, 'created_by não pode ser alterado';
  exception when insufficient_privilege then null; end;
  begin
    update public.profiles set id = gen_random_uuid() where id = auth.uid();
    assert false, 'id do perfil não pode ser alterado';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.audit_log (organization_id, action) values (b, 'forjado');
    assert false, 'auditoria não pode ser escrita direto';
  exception when insufficient_privilege then null; end;
end $$;

-- 5) Perfil: A altera o próprio nome, não o de B
do $$ declare n int; begin
  update public.profiles set full_name = 'Ana Silva' where id = '00000000-0000-0000-0000-00000000000a';
  get diagnostics n = row_count;
  assert n = 1, 'A deveria alterar o próprio perfil';
  update public.profiles set full_name = 'X' where id = '00000000-0000-0000-0000-00000000000b';
  get diagnostics n = row_count;
  assert n = 0, 'A não pode alterar o perfil de B';
end $$;

-- 6) Leitora C: vê a Empresa A, não altera, não vê auditoria, não vê a Empresa B
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000c', true);
do $$ declare n int; a uuid := (select v from ctx where k = 'orgA'); begin
  assert (select count(*) from public.organizations) = 1, 'C deveria ver só a Empresa A';
  assert (select count(*) from public.organization_members where organization_id = a) = 2, 'C deveria ver os 2 membros da A';
  update public.organizations set name = 'Leitor mexeu' where id = a;
  get diagnostics n = row_count;
  assert n = 0, 'leitor não pode alterar a empresa';
  assert (select count(*) from public.audit_log) = 0, 'leitor não vê auditoria';
end $$;

-- 7) Sem login: nada de leitura nem de criação
reset role;
set local role anon;
do $$ begin
  begin
    perform count(*) from public.organizations;
    assert false, 'anon não pode ler organizations';
  exception when insufficient_privilege then null; end;
  begin
    perform public.create_organization('Anon');
    assert false, 'anon não pode criar empresa';
  exception when insufficient_privilege then null; end;
end $$;

-- 8) Logado sem sessão válida e dados inválidos
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin
    perform public.create_organization('Sem sessão');
    assert false, 'sem sessão não pode criar empresa';
  exception when sqlstate '28000' then null; end;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', true);
do $$ begin
  begin
    perform public.create_organization('x');
    assert false, 'nome curto deveria ser recusado';
  exception when check_violation then null; end;
end $$;

reset role;
select 'OK: todos os testes de isolamento passaram' as resultado;
rollback;
