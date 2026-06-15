export interface LibrasVideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  category: 'tutorial' | 'funcionalidade' | 'acessibilidade';
}

// IDs de placeholder — substituir com IDs reais do YouTube após gravação
export const librasVideos: LibrasVideoItem[] = [
  {
    id: 'login',
    youtubeId: 'PLACEHOLDER_LOGIN',
    title: 'Como fazer login',
    description: 'Tutorial em Libras mostrando como acessar o sistema.',
    category: 'tutorial',
  },
  {
    id: 'dashboard',
    youtubeId: 'PLACEHOLDER_DASHBOARD',
    title: 'Navegando pelo Dashboard',
    description: 'Visão geral das funcionalidades do painel principal.',
    category: 'funcionalidade',
  },
  {
    id: 'agendamento',
    youtubeId: 'PLACEHOLDER_AGENDAMENTO',
    title: 'Como agendar um serviço',
    description: 'Passo a passo para criar e gerenciar agendamentos.',
    category: 'tutorial',
  },
  {
    id: 'cliente',
    youtubeId: 'PLACEHOLDER_CLIENTE',
    title: 'Cadastro de clientes',
    description: 'Como cadastrar e gerenciar clientes no sistema.',
    category: 'tutorial',
  },
  {
    id: 'agenda',
    youtubeId: 'PLACEHOLDER_AGENDA',
    title: 'Gerenciando a agenda',
    description: 'Como visualizar e organizar a agenda de atendimentos.',
    category: 'funcionalidade',
  },
  {
    id: 'acessibilidade',
    youtubeId: 'PLACEHOLDER_ACESSIBILIDADE',
    title: 'Central de acessibilidade',
    description: 'Recursos disponíveis para usuários com deficiência auditiva.',
    category: 'acessibilidade',
  },
];
