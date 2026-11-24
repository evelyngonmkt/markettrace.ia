import { useState, type FormEvent } from 'react';

import { FormMessage } from '../components/ui';
import type { OrganizationInput } from '../lib/types';

export function CompanyForm({
  initial,
  submitLabel,
  readOnly = false,
  onSubmit,
}: {
  initial?: Partial<OrganizationInput>;
  submitLabel: string;
  readOnly?: boolean;
  onSubmit: (value: OrganizationInput) => Promise<{ error: string | null }>;
}) {
  const [value, setValue] = useState<OrganizationInput>({
    name: initial?.name ?? '',
    segment: initial?.segment ?? '',
    website: initial?.website ?? '',
    main_goal: initial?.main_goal ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof OrganizationInput) => (event: { target: { value: string } }) => {
    setSaved(false);
    setValue((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    if (value.name.trim().length < 2) {
      setError('Informe o nome da empresa (mínimo de 2 caracteres).');
      return;
    }
    setBusy(true);
    const result = await onSubmit(value);
    setBusy(false);
    if (result.error) setError(result.error);
    else setSaved(true);
  };

  return (
    <form onSubmit={(event) => void submit(event)}>
      <label className="field-label" htmlFor="company-name">
        Nome da empresa
      </label>
      <input
        id="company-name"
        className="field-input"
        required
        maxLength={120}
        disabled={readOnly}
        value={value.name}
        onChange={set('name')}
        placeholder="Ex.: Studio Aurora"
      />
      <label className="field-label" htmlFor="company-segment">
        Segmento
      </label>
      <input
        id="company-segment"
        className="field-input"
        maxLength={120}
        disabled={readOnly}
        value={value.segment}
        onChange={set('segment')}
        placeholder="Ex.: Moda, SaaS B2B, Educação"
      />
      <label className="field-label" htmlFor="company-website">
        Site
      </label>
      <input
        id="company-website"
        className="field-input"
        type="url"
        maxLength={300}
        disabled={readOnly}
        value={value.website}
        onChange={set('website')}
        placeholder="https://suaempresa.com.br"
      />
      <label className="field-label" htmlFor="company-goal">
        Objetivo principal
      </label>
      <textarea
        id="company-goal"
        className="field-input field-textarea"
        maxLength={500}
        disabled={readOnly}
        value={value.main_goal}
        onChange={set('main_goal')}
        placeholder="O que a empresa precisa alcançar nos próximos meses?"
      />
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {saved && <FormMessage tone="info">Salvo.</FormMessage>}
      {!readOnly && (
        <button className="button button-primary form-submit" disabled={busy}>
          {busy ? 'Salvando…' : submitLabel}
        </button>
      )}
    </form>
  );
}
