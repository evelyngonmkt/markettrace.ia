import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardPenLine,
  Database,
  FileText,
  FlaskConical,
  Gauge,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  UploadCloud,
  Users,
  X,
} from './components/icons';

type IconComponent = typeof LayoutDashboard;

type NavItem = {
  label: string;
  path: string;
  icon: IconComponent;
  badge?: string;
};

const primaryNavigation: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Inteligência', path: '/intelligence', icon: BrainCircuit, badge: 'core' },
  { label: 'Pesquisa de mercado', path: '/research', icon: Search },
  { label: 'Memória empresarial', path: '/memory', icon: Database },
  { label: 'Relatórios', path: '/reports', icon: FileText },
];

const workspaceNavigation: NavItem[] = [
  { label: 'Empresa e equipe', path: '/company', icon: Building2 },
  { label: 'Configurações', path: '/settings', icon: Settings2 },
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/intelligence': 'Inteligência',
  '/research': 'Pesquisa de mercado',
  '/memory': 'Memória empresarial',
  '/reports': 'Relatórios',
  '/company': 'Empresa e equipe',
  '/settings': 'Configurações',
};

function Brand({ compact = false }: { compact?: boolean }) {
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

function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="side-nav" aria-label="Navegação principal">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}
            to={item.path}
            end={item.path === '/'}
            onClick={onNavigate}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      <div className={`sidebar-backdrop${mobileOpen ? ' visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-topline">
          <Brand />
          <button className="icon-button mobile-close" onClick={onClose} aria-label="Fechar menu">
            <X size={19} />
          </button>
        </div>

        <div className="workspace-switcher">
          <span className="workspace-avatar">N</span>
          <span className="workspace-meta">
            <small>Workspace</small>
            <strong>Nova empresa</strong>
          </span>
          <ChevronDown size={15} />
        </div>

        <div className="nav-section-label">Produto</div>
        <SidebarNav items={primaryNavigation} onNavigate={onClose} />

        <div className="nav-section-label workspace-label">Workspace</div>
        <SidebarNav items={workspaceNavigation} onNavigate={onClose} />

        <div className="sidebar-spacer" />
        <div className="sidebar-footer">
          <div className="credit-note">
            <div className="credit-icon">
              <Sparkles size={15} />
            </div>
            <div>
              <strong>Fundação visual</strong>
              <span>Entrega 1 · em preparação</span>
            </div>
          </div>
          <NavLink className="help-link" to="/settings" onClick={onClose}>
            <CircleHelp size={16} />
            Central de ajuda
          </NavLink>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] ?? 'MarketTrace AI';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Abrir menu">
          <Menu size={19} />
        </button>
        <div className="breadcrumbs">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <strong>{title}</strong>
        </div>
      </div>
      <div className="topbar-actions">
        <span className="environment-chip">
          <i /> Fundação independente
        </span>
        <button className="icon-button notification-button" aria-label="Notificações">
          <Bell size={18} />
          <i />
        </button>
        <div className="profile-chip">
          <span className="profile-avatar">MT</span>
          <span className="profile-name">Minha conta</span>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pageTitles[pathname];
    document.title = page ? `${page} — MarketTrace AI` : 'MarketTrace AI';
  }, [pathname]);

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="app-content">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function PageIntro({
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

function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'violet' | 'green';
}) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function EmptyState({
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
  action?: React.ReactNode;
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

function FlowTrack() {
  const steps = [
    {
      label: 'Brief de negócio',
      caption: 'Ponto de partida',
      icon: ClipboardPenLine,
      state: 'active',
    },
    { label: 'Pesquisa', caption: 'Sinais externos', icon: Search, state: 'next' },
    { label: 'Contexto', caption: 'Memória da empresa', icon: Database, state: 'next' },
    { label: 'Relatório', caption: 'Decisão fundamentada', icon: FileText, state: 'next' },
  ];

  return (
    <div className="flow-track">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div className="flow-step-wrap" key={step.label}>
            <div className={`flow-step ${step.state}`}>
              <span className="flow-icon">
                <Icon size={18} />
              </span>
              <span className="flow-copy">
                <strong>{step.label}</strong>
                <small>{step.caption}</small>
              </span>
            </div>
            {index < steps.length - 1 && <span className="flow-line" />}
          </div>
        );
      })}
    </div>
  );
}

function Dashboard() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Visão geral · 01"
        title="Transforme sinais em decisões sólidas."
        description="A fundação da MarketTrace AI organiza o caminho entre o seu desafio de negócio, o mercado e uma recomendação fundamentada."
        action={
          <NavLink className="button button-quiet" to="/intelligence">
            <Sparkles size={16} /> Explorar inteligência <ArrowRight size={16} />
          </NavLink>
        }
      />

      <section className="hero-panel">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="hero-copy">
          <div className="hero-label">
            <span className="live-dot" /> Seu workspace está pronto para começar
          </div>
          <h2>
            Do primeiro <span>brief</span> ao próximo movimento.
          </h2>
          <p>
            Conecte intenção, evidência e contexto em um único fluxo de inteligência estratégica.
          </p>
          <NavLink className="button button-primary" to="/intelligence">
            Conhecer o fluxo <ArrowRight size={16} />
          </NavLink>
        </div>
        <div className="hero-signal">
          <div className="signal-header">
            <span>MAPA DE INTELIGÊNCIA</span>
            <Activity size={15} />
          </div>
          <div className="signal-lines">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="signal-footer">
            <span>Brief</span>
            <span>Research</span>
            <span>Context</span>
            <span>Report</span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Fluxo principal</span>
            <h2>Uma linha de raciocínio, quatro movimentos.</h2>
          </div>
          <StatusPill tone="violet">
            <Sparkles size={13} /> Estrutura pronta
          </StatusPill>
        </div>
        <div className="surface-card flow-card">
          <FlowTrack />
        </div>
      </section>

      <section className="dashboard-columns">
        <div className="surface-card workspace-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Próximo movimento</span>
              <h3>Comece pelo contexto certo.</h3>
            </div>
            <span className="card-index">01</span>
          </div>
          <p className="card-description">
            A inteligência começa quando o desafio de negócio fica claro. A estrutura do brief já
            está preparada para receber sua primeira pergunta.
          </p>
          <div className="brief-preview">
            <div className="preview-line wide" />
            <div className="preview-line" />
            <div className="preview-line short" />
            <span className="preview-cursor" />
          </div>
          <NavLink className="text-link" to="/intelligence">
            Ver estrutura do brief <ArrowRight size={15} />
          </NavLink>
        </div>
        <div className="surface-card status-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Status da fundação</span>
              <h3>O que está conectado?</h3>
            </div>
            <Gauge size={19} />
          </div>
          <div className="status-list">
            <StatusRow
              icon={CheckCircle2}
              label="Interface e navegação"
              value="Pronto"
              tone="green"
            />
            <StatusRow icon={CheckCircle2} label="Fluxo de produto" value="Mapeado" tone="violet" />
            <StatusRow icon={Activity} label="Dados e inteligência" value="Próxima entrega" />
          </div>
          <div className="card-footnote">
            <ShieldCheck size={14} /> Sem dados fictícios nesta fundação
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: IconComponent;
  label: string;
  value: string;
  tone?: 'neutral' | 'violet' | 'green';
}) {
  return (
    <div className="status-row">
      <span className={`status-row-icon ${tone}`}>
        <Icon size={15} />
      </span>
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

function Intelligence() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Módulo core · 02"
        title="Inteligência que começa com uma boa pergunta."
        description="Organize o brief de negócio antes de buscar sinais. Esta tela será o ponto de partida do fluxo principal da MarketTrace AI."
        action={
          <StatusPill tone="violet">
            <FlaskConical size={13} /> Em preparação
          </StatusPill>
        }
      />
      <section className="intelligence-layout">
        <div className="surface-card brief-editor">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Brief de negócio</span>
              <h3>O que você precisa decidir?</h3>
            </div>
            <span className="step-count">
              01 <span>/ 04</span>
            </span>
          </div>
          <p className="card-description">
            Conte o contexto, a tensão e o resultado que sua empresa precisa alcançar. Quanto melhor
            a pergunta, melhor a inteligência.
          </p>
          <label className="field-label" htmlFor="brief-title">
            Título do desafio
          </label>
          <input
            id="brief-title"
            className="field-input"
            disabled
            placeholder="Ex.: Entender a queda de conversão no segmento B2B"
          />
          <label className="field-label" htmlFor="brief-context">
            Contexto do negócio
          </label>
          <textarea
            id="brief-context"
            className="field-input field-textarea"
            disabled
            placeholder="A estrutura de entrada do brief estará disponível na próxima etapa."
          />
          <div className="editor-footer">
            <span>
              <LockKeyhole size={14} /> Entrada de brief ainda não conectada
            </span>
            <button className="button button-disabled" disabled>
              Salvar brief
            </button>
          </div>
        </div>
        <aside className="surface-card intelligence-aside">
          <span className="eyebrow">Como funciona</span>
          <h3>Da pergunta à clareza.</h3>
          <div className="mini-timeline">
            <TimelineItem
              number="01"
              title="Formule"
              description="Dê forma ao desafio real."
              active
            />
            <TimelineItem number="02" title="Investigue" description="Cruze sinais do mercado." />
            <TimelineItem
              number="03"
              title="Contextualize"
              description="Conecte a memória da empresa."
            />
            <TimelineItem number="04" title="Decida" description="Receba uma visão fundamentada." />
          </div>
          <div className="aside-callout">
            <Sparkles size={16} />
            <span>A IA será conectada somente após a aprovação da fundação técnica.</span>
          </div>
        </aside>
      </section>
      <section className="surface-card intelligence-preview">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Qualidade do raciocínio</span>
            <h3>O resultado começa no enquadramento.</h3>
          </div>
          <BrainCircuit size={20} />
        </div>
        <div className="quality-grid">
          <QualityItem icon={TargetIcon} title="Foco" text="Uma decisão clara, sem dispersão." />
          <QualityItem icon={Globe2} title="Panorama" text="O mercado visto em contexto." />
          <QualityItem
            icon={BookOpenCheck}
            title="Rastreabilidade"
            text="Fontes e memória no mesmo fio."
          />
        </div>
      </section>
    </div>
  );
}

function TargetIcon({ size = 20 }: { size?: number }) {
  return (
    <span className="target-icon" style={{ width: size, height: size }}>
      <i />
      <i />
    </span>
  );
}

function TimelineItem({
  number,
  title,
  description,
  active = false,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className={`timeline-item${active ? ' active' : ''}`}>
      <span className="timeline-number">{number}</span>
      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}

function QualityItem({
  icon: Icon,
  title,
  text,
}: {
  icon: IconComponent | typeof TargetIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="quality-item">
      <span className="quality-icon">
        <Icon size={18} />
      </span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function Research() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Sinais externos · 03"
        title="Pesquisa que dá contexto ao movimento."
        description="A área para organizar perguntas de mercado, fontes e sinais que ajudam a validar uma decisão — com transparência sobre o que está conectado."
        action={
          <StatusPill>
            <Search size={13} /> Sem fontes conectadas
          </StatusPill>
        }
      />
      <section className="research-grid">
        <div className="surface-card research-start">
          <div className="research-icon">
            <Search size={22} />
          </div>
          <span className="eyebrow">Nova pesquisa</span>
          <h3>Qual sinal você quer investigar?</h3>
          <p>
            O espaço de pesquisa está desenhado para reunir hipóteses, fontes e achados em um único
            contexto.
          </p>
          <div className="search-field">
            <Search size={17} />
            <span>A pesquisa de mercado será configurada em uma próxima entrega</span>
          </div>
          <button className="button button-disabled" disabled>
            <Plus size={16} /> Iniciar pesquisa
          </button>
          <span className="disabled-note">
            <LockKeyhole size={13} /> Coleta e análise ainda não implementadas
          </span>
        </div>
        <div className="surface-card sources-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Biblioteca de fontes</span>
              <h3>Suas referências, em um só lugar.</h3>
            </div>
            <Globe2 size={19} />
          </div>
          <EmptyState
            icon={UploadCloud}
            eyebrow="Nenhuma fonte adicionada"
            title="A biblioteca ainda está vazia"
            description="URLs, documentos e outras fontes aparecerão aqui quando a ingestão de dados estiver disponível."
          />
        </div>
      </section>
      <section className="surface-card research-principles">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Princípios do módulo</span>
            <h3>Pesquisa sem ruído, com rastreabilidade.</h3>
          </div>
        </div>
        <div className="principle-grid">
          <Principle
            icon={Globe2}
            title="Panorama"
            description="Sinais externos organizados por tema e relevância."
          />
          <Principle
            icon={ShieldCheck}
            title="Confiança"
            description="A origem da informação acompanha cada achado."
          />
          <Principle
            icon={BarChart3}
            title="Comparação"
            description="Padrões e mudanças tornam-se visíveis ao longo do tempo."
          />
        </div>
      </section>
    </div>
  );
}

function Principle({
  icon: Icon,
  title,
  description,
}: {
  icon: IconComponent;
  title: string;
  description: string;
}) {
  return (
    <div className="principle">
      <Icon size={18} />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Memory() {
  const memoryAreas = [
    { icon: Building2, label: 'Empresa', text: 'Posicionamento, objetivos e contexto.' },
    { icon: Users, label: 'Pessoas', text: 'Times, especialistas e perspectivas.' },
    { icon: FileText, label: 'Documentos', text: 'Materiais internos e aprendizados.' },
    { icon: Activity, label: 'Histórico', text: 'Decisões e sinais acumulados.' },
  ];
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Contexto proprietário · 04"
        title="A memória que torna cada análise sua."
        description="Um espaço para preservar o contexto empresarial e fazer com que a inteligência reconheça o que já foi aprendido."
        action={
          <StatusPill>
            <Database size={13} /> Sem memória conectada
          </StatusPill>
        }
      />
      <section className="memory-banner">
        <div className="memory-banner-icon">
          <Database size={24} />
        </div>
        <div>
          <span className="eyebrow">Memória empresarial</span>
          <h2>Contexto proprietário, no centro da decisão.</h2>
          <p>
            A persistência de dados, documentos e conhecimento interno será habilitada em uma
            próxima entrega.
          </p>
        </div>
        <span className="preparation-stamp">EM PREPARAÇÃO</span>
      </section>
      <section className="memory-grid">
        {memoryAreas.map(({ icon: Icon, label, text }) => (
          <div className="surface-card memory-card" key={label}>
            <span className="memory-card-icon">
              <Icon size={19} />
            </span>
            <span className="eyebrow">{label}</span>
            <h3>{text}</h3>
            <div className="memory-placeholder">
              <i />
              <i />
              <i />
            </div>
            <span className="disabled-note">
              <LockKeyhole size={13} /> Persistência não implementada
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

function Reports() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Decisão fundamentada · 05"
        title="Relatórios que fecham o ciclo."
        description="Quando brief, pesquisa e memória estiverem conectados, esta será a camada para transformar evidência em recomendação acionável."
        action={
          <StatusPill tone="violet">
            <FileText size={13} /> Estrutura pronta
          </StatusPill>
        }
      />
      <section className="surface-card reports-empty">
        <div className="report-orbit">
          <FileText size={25} />
        </div>
        <span className="eyebrow">Seu acervo estratégico</span>
        <h2>Nenhum relatório ainda.</h2>
        <p>
          Os relatórios aparecerão aqui com a pergunta de negócio, fontes consultadas, contexto
          utilizado e uma recomendação rastreável.
        </p>
        <div className="report-anatomy">
          <span>
            <ClipboardPenLine size={15} /> Brief
          </span>
          <span>
            <Search size={15} /> Evidências
          </span>
          <span>
            <Database size={15} /> Contexto
          </span>
          <span>
            <CheckCircle2 size={15} /> Recomendação
          </span>
        </div>
        <button className="button button-disabled" disabled>
          <Plus size={16} /> Novo relatório
        </button>
        <span className="disabled-note">
          <LockKeyhole size={13} /> Geração de relatórios ainda não implementada
        </span>
      </section>
    </div>
  );
}

function Company() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Workspace · 06"
        title="Uma inteligência feita em conjunto."
        description="Organize a identidade da empresa e prepare o espaço onde diferentes perspectivas poderão alimentar decisões melhores."
        action={
          <StatusPill>
            <Users size={13} /> Colaboração em preparação
          </StatusPill>
        }
      />
      <section className="company-grid">
        <div className="surface-card company-card-main">
          <div className="company-profile-mark">N</div>
          <span className="eyebrow">Workspace atual</span>
          <h2>Nova empresa</h2>
          <p>Seu workspace ainda não possui informações empresariais conectadas.</p>
          <div className="profile-lines">
            <div>
              <span>Nome da empresa</span>
              <strong>Não configurado</strong>
            </div>
            <div>
              <span>Segmento</span>
              <strong>Não configurado</strong>
            </div>
            <div>
              <span>Objetivo principal</span>
              <strong>Não configurado</strong>
            </div>
          </div>
          <button className="button button-disabled" disabled>
            <Settings2 size={16} /> Editar informações
          </button>
        </div>
        <div className="surface-card team-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Equipe</span>
              <h3>Quem pensa com você.</h3>
            </div>
            <Users size={19} />
          </div>
          <EmptyState
            icon={Users}
            eyebrow="Nenhum membro adicionado"
            title="O workspace começa com você"
            description="Convites, papéis e permissões serão liberados quando a colaboração estiver implementada."
            action={
              <button className="button button-disabled" disabled>
                <Plus size={16} /> Convidar pessoa
              </button>
            }
          />
        </div>
      </section>
    </div>
  );
}

function Settings() {
  const settings = [
    {
      icon: ShieldCheck,
      title: 'Privacidade e dados',
      description: 'Controles de acesso e uso de informações.',
      status: 'Próxima entrega',
    },
    {
      icon: Bell,
      title: 'Notificações',
      description: 'Escolha quando receber atualizações da inteligência.',
      status: 'Não configurado',
    },
    {
      icon: SlidersHorizontal,
      title: 'Preferências de análise',
      description: 'Defina como o produto apresenta evidências e relatórios.',
      status: 'Não configurado',
    },
  ];
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Sistema · 07"
        title="Configurações do seu workspace."
        description="A base para personalizar a experiência, manter seus dados sob controle e preparar as preferências de inteligência."
        action={
          <StatusPill>
            <Settings2 size={13} /> Estrutura visual
          </StatusPill>
        }
      />
      <section className="settings-list surface-card">
        {settings.map(({ icon: Icon, title, description, status }) => (
          <div className="setting-row" key={title}>
            <span className="setting-icon">
              <Icon size={18} />
            </span>
            <div className="setting-copy">
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
            <span className="setting-status">{status}</span>
            <button className="toggle" disabled aria-label={`${title} indisponível`}>
              <span />
            </button>
            <ChevronRight size={17} className="setting-arrow" />
          </div>
        ))}
      </section>
      <section className="surface-card settings-footer">
        <div>
          <span className="eyebrow">Sessão</span>
          <h3>Conta e acesso</h3>
          <p>A autenticação está apenas preparada visualmente nesta entrega.</p>
        </div>
        <NavLink className="button button-quiet" to="/login">
          <LogOut size={16} /> Ver tela de login
        </NavLink>
      </section>
    </div>
  );
}

function Login() {
  useEffect(() => {
    document.title = 'Login — MarketTrace AI';
  }, []);

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-grid" />
        <Brand />
        <div className="login-visual-copy">
          <span className="eyebrow">Inteligência para quem decide</span>
          <h1>
            O mercado muda.
            <br />
            <span>Seu contexto também importa.</span>
          </h1>
          <p>MarketTrace AI aproxima evidência, contexto e ação em uma experiência única.</p>
          <div className="login-visual-note">
            <Sparkles size={16} />
            <span>Fundação visual independente · 2026</span>
          </div>
        </div>
        <div className="login-visual-footer">
          <span>MARKETTRACE AI</span>
          <span>Estratégia com rastreabilidade</span>
        </div>
      </div>
      <div className="login-panel">
        <NavLink className="back-link" to="/">
          <ArrowRight size={15} /> Voltar para o produto
        </NavLink>
        <div className="login-card">
          <div className="login-card-icon">
            <LockKeyhole size={19} />
          </div>
          <span className="eyebrow">Acesso ao workspace</span>
          <h2>Entre para continuar.</h2>
          <p>
            A autenticação será conectada em uma próxima entrega. Por enquanto, esta tela define a
            experiência de acesso.
          </p>
          <form onSubmit={(event) => event.preventDefault()}>
            <label className="field-label" htmlFor="email">
              E-mail corporativo
            </label>
            <input
              id="email"
              className="field-input"
              type="email"
              disabled
              placeholder="seu@empresa.com"
            />
            <label className="field-label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              className="field-input"
              type="password"
              disabled
              placeholder="••••••••"
            />
            <button className="button button-primary login-submit" disabled>
              Entrar no workspace <ArrowRight size={16} />
            </button>
          </form>
          <span className="disabled-note login-note">
            <LockKeyhole size={13} /> Login ainda não implementado
          </span>
        </div>
        <div className="login-panel-footer">
          <span>Ao continuar, você concordará com os termos da sua organização.</span>
          <span>v0.1 · Fundação</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="intelligence" element={<Intelligence />} />
        <Route path="research" element={<Research />} />
        <Route path="memory" element={<Memory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="company" element={<Company />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
