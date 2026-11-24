import { describe, expect, it } from 'vitest';

import { friendlyError } from './messages';
import { canEditOrganization } from './types';

describe('canEditOrganization', () => {
  it('permite apenas dono e administrador', () => {
    expect(canEditOrganization('owner')).toBe(true);
    expect(canEditOrganization('admin')).toBe(true);
    expect(canEditOrganization('member')).toBe(false);
    expect(canEditOrganization('viewer')).toBe(false);
    expect(canEditOrganization(undefined)).toBe(false);
  });
});

describe('friendlyError', () => {
  it('traduz credenciais inválidas sem expor detalhes', () => {
    expect(friendlyError({ message: 'Invalid login credentials' })).toBe(
      'E-mail ou senha incorretos.',
    );
  });
  it('traduz bloqueio por permissão', () => {
    expect(friendlyError({ code: '42501', message: 'x' })).toContain('permissão');
  });
  it('usa mensagem genérica para erros desconhecidos', () => {
    expect(friendlyError({ message: 'boom interno' })).toBe(
      'Não foi possível concluir. Tente novamente.',
    );
  });
});
