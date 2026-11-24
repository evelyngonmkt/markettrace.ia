/** Traduz erros do Supabase para mensagens claras, sem expor detalhes internos. */
export function friendlyError(
  error: { message?: string; code?: string } | null | undefined,
): string {
  const text = `${error?.message ?? ''}`.toLowerCase();
  if (text.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (text.includes('email not confirmed'))
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
  if (text.includes('already registered') || text.includes('already been registered'))
    return 'Este e-mail já tem cadastro. Tente entrar ou recuperar a senha.';
  if (text.includes('password should be') || text.includes('weak'))
    return 'A senha precisa ter pelo menos 8 caracteres.';
  if (
    text.includes('rate limit') ||
    text.includes('security purposes') ||
    text.includes('too many')
  )
    return 'Muitas tentativas seguidas. Aguarde um instante e tente de novo.';
  if (text.includes('invalid email') || text.includes('unable to validate email'))
    return 'Confira o e-mail digitado.';
  if (text.includes('failed to fetch') || text.includes('network'))
    return 'Sem conexão com o servidor. Verifique sua internet e tente de novo.';
  if (
    error?.code === '42501' ||
    text.includes('permission denied') ||
    text.includes('row-level security')
  )
    return 'Você não tem permissão para fazer isso.';
  if (error?.code === '23514') return 'Confira os campos: algum valor está fora do permitido.';
  return 'Não foi possível concluir. Tente novamente.';
}

export const MIN_PASSWORD = 8;
