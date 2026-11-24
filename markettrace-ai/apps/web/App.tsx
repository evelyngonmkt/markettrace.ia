import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
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
  UploadCloud,
  Users,
  X,
} from './components/icons';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { RequireAuth, RequireOrganization } from './auth/Gates';
import { Login } from './auth/Login';
import { ResetPassword } from './auth/ResetPassword';
import { Brand, EmptyState, PageIntro, StatusPill } from './components/ui';
import { roleLabels } from './lib/types';
import { OrgProvider, useOrg } from './org/OrgContext';
import { Account } from './pages/Account';
import { Company, NewCompany } from './pages/Company';

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
  { label: 'Minha conta', path: '/settings', icon: Settings2 },
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/intelligence': 'Inteligência',
  '/research': 'Pesquisa de mercado',
  '/memory': 'Memória empresarial',
  '/reports': 'Relatórios',
  '/company': 'Empresa e equipe',
  '/company/new': 'Nova empresa',
  '/settings': 'Minha conta',
};

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
  const { memberships, current, select } = useOrg();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = current?.organization.name ?? 'Workspace';

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

        <div className="workspace-wrap">
          <button
            type="button"
            className="workspace-switcher"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="workspace-avatar">{name.charAt(0).toUpperCase()}</span>
            <span className="workspace-meta">
              <small>Empresa</small>
              <strong>{name}</strong>
            </span>
            <ChevronDown size={15} />
          </button>
          {menuOpen && (
            <div className="workspace-menu" role="listbox" aria-label="Empresas">
              {memberships.map((m) => (
                <button
                  key={m.organization.id}
                  type="button"
                  role="option"
                  aria-selected={m.organization.id === current?.organization.id}
                  className={`workspace-option${m.organization.id === current?.organization.id ? ' active' : ''}`}
                  onClick={() => {
                    select(m.organization.id);
                    setMenuOpen(false);
                    onClose();
                  }}
                >
                  <span>{m.organization.name}</span>
                  <small>{roleLabels[m.role]}</small>
                </button>
              ))}
              <NavLink
                className="workspace-add"
                to="/company/new"
                onClick={() => {
                  setMenuOpen(false);
                  onClose();
                }}
              >
                <Plus size={14} /> Nova empresa
              </NavLink>
            </div>
          )}
        </div>

        <div className="nav-section-label">Produto</div>
        <SidebarNav items={primaryNavigation} onNavigate={onClose} />

        <div className="nav-section-label workspace-label">Workspace</div>
        <SidebarNav items={workspaceNavigation} onNavigate={onClose} />

        <div className="sidebar-spacer" />
        <div className="sidebar-footer">
          <button type="button" className="help-link sign-out-link" onClick={() => void signOut()}>
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation();
  const { current } = useOrg();
  const { user } = useAuth();
  const title = pageTitles[pathname] ?? 'MarketTrace AI';
  const meta = user?.user_metadata as { full_name?: string } | undefined;
  const label = meta?.full_name?.trim() || user?.email || 'Minha conta';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Abrir menu">
          <Menu size={19} />
        </button>
        <div className="breadcrumbs">
          <span>{current?.organization.name ?? 'Workspace'}</span>
          <ChevronRight size={14} />
          <strong>{title}</strong>
        </div>
      </div>
      <div className="topbar-actions">
        {current && (
          <span className="environment-chip">
            <i /> {roleLabels[current.role]}
          </span>
        )}
        <NavLink className="profile-chip" to="/settings" aria-label="Minha conta">
          <span className="profile-avatar">{label.charAt(0).toUpperCase()}</span>
          <span className="profile-name">{label}</span>
        </NavLink>
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
  const { current } = useOrg();
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Visão geral · 01"
        title="Transforme sinais em decisões sólidas."
        description="A MarketTrace AI organiza o caminho entre o seu desafio de negócio, o mercado e uma recomendação fundamentada."
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
            <span className="live-dot" /> {current?.organization.name ?? 'Seu workspace'} está
            pronto para começar
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
              <span className="eyebrow">Status do workspace</span>
              <h3>O que está conectado?</h3>
            </div>
            <Gauge size={19} />
          </div>
          <div className="status-list">
            <StatusRow icon={CheckCircle2} label="Conta e acesso" value="Ativo" tone="green" />
            <StatusRow
              icon={CheckCircle2}
              label="Empresa e dados"
              value="Cadastrada"
              tone="green"
            />
            <StatusRow
              icon={Activity}
              label="Pesquisa, memória e relatórios"
              value="Próxima entrega"
            />
          </div>
          <div className="card-footnote">
            <ShieldCheck size={14} /> Sem dados fictícios: tudo aqui vem do seu workspace
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
            <span>A IA será conectada nas próximas etapas, depois da base de contas e dados.</span>
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

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />
        <Route
          element={
            <RequireAuth>
              <OrgProvider>
                <RequireOrganization>
                  <AppShell />
                </RequireOrganization>
              </OrgProvider>
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="intelligence" element={<Intelligence />} />
          <Route path="research" element={<Research />} />
          <Route path="memory" element={<Memory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="company" element={<Company />} />
          <Route path="company/new" element={<NewCompany />} />
          <Route path="settings" element={<Account />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
