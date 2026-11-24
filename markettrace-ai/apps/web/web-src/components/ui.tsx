import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import type { Icon as IconComponent } from './icons';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <NavLink className="brand" to="/" aria-label="Ir para o dashboard da MarketTrace AI">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 128 104" fill="none">
          <path
            d="M12 90V14l36 42 36-42v54q0 22 22 22"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle className="brand-dot" cx="118" cy="90" r="9" />
        </svg>
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>
            markettrace<b>.</b>
          </strong>
          <em>ai</em>
        </span>
      )}
    </NavLink>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="intro-action">{action}</div>}
    </div>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'violet' | 'green';
}) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon: IconComponent;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={22} />
      </div>
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: 'error' | 'info'; children: ReactNode }) {
  return (
    <p className={`form-message ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

export function Splash({ label }: { label: string }) {
  return (
    <div className="splash" role="status">
      <span className="live-dot" /> {label}
    </div>
  );
}
