import { Hand, Volume2, ChevronLeft, ExternalLink, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAlphabetSign, getNumberSign } from "@/components/LibrasHandSigns";

const HAS_IMAGE: Record<string, boolean> = {
  A: true, B: true, C: true, D: true, E: true, F: true, G: true,
  H: true, I: true, J: true, K: true, L: true, M: true, N: true,
  O: true, P: true, Q: true, R: true, S: true, T: true, U: true,
  V: true, W: true, X: true, Y: true, Z: true,
};

function signImagePath(letter: string): string {
  if (letter === "Ç") return "/image/libras/cedilha.jpg";
  return `/image/libras/${letter.toLowerCase()}.jpg`;
}

const alphabetLibra = [
  { letter: "A", desc: "Mão fechada com polegar estendido para cima" },
  { letter: "B", desc: "Mão aberta com todos os dedos estendidos e unidos" },
  { letter: "C", desc: "Mão formando formato da letra C com os dedos curvados" },
  { letter: "Ç", desc: "Movimento do C com a cedilha (C + movimento do gancho)" },
  { letter: "D", desc: "Mão fechada com indicador levantado, polegar tocando o médio" },
  { letter: "E", desc: "Dedos dobrados, polegar sobre os dedos" },
  { letter: "F", desc: "Polegar e indicador formando círculo, demais dedos estendidos" },
  { letter: "G", desc: "Mão fechada com indicador apontando para frente" },
  { letter: "H", desc: "Indicador e médio estendidos na horizontal" },
  { letter: "I", desc: "Mão fechada com mindinho levantado" },
  { letter: "J", desc: "Mindinho desenha a letra J no ar" },
  { letter: "K", desc: "Indicador e médio abertos, polegar entre eles" },
  { letter: "L", desc: "Indicador para cima e polegar estendido formando L" },
  { letter: "M", desc: "Polegar sob os dedos indicador, médio e anelar" },
  { letter: "N", desc: "Polegar sob os dedos indicador e médio" },
  { letter: "O", desc: "Todos os dedos formando círculo (formato de O)" },
  { letter: "P", desc: "Indicador apontando para frente, médio atrás" },
  { letter: "Q", desc: "Polegar e indicador para baixo como pinça" },
  { letter: "R", desc: "Indicador e médio cruzados" },
  { letter: "S", desc: "Mão fechada com polegar sobre os dedos" },
  { letter: "T", desc: "Polegar entre indicador e médio" },
  { letter: "U", desc: "Indicador e médio unidos apontando para cima" },
  { letter: "V", desc: "Indicador e médio abertos em formato de V" },
  { letter: "W", desc: "Indicador, médio e anelar estendidos (3 dedos)" },
  { letter: "X", desc: "Indicador curvado formando gancho" },
  { letter: "Y", desc: "Polegar e mindinho estendidos" },
  { letter: "Z", desc: "Indicador desenha a letra Z no ar" },
];

const numbersLibra = [
  { number: "0", desc: "Dedos formando círculo (formato de zero)" },
  { number: "1", desc: "Indicador levantado" },
  { number: "2", desc: "Indicador e médio levantados" },
  { number: "3", desc: "Polegar, indicador e médio levantados" },
  { number: "4", desc: "Quatro dedos levantados (polegar sobre a palma)" },
  { number: "5", desc: "Mão aberta com todos os dedos estendidos" },
  { number: "6", desc: "Polegar toca o mindinho, demais dedos levantados" },
  { number: "7", desc: "Polegar toca o anelar, demais dedos levantados" },
  { number: "8", desc: "Polegar toca o dedo médio, demais dedos estendidos" },
  { number: "9", desc: "Polegar toca o indicador, demais dedos estendidos" },
];

const phrasesLibra = [
  { phrase: "Olá", desc: "Mão aberta balançando de um lado para o outro" },
  { phrase: "Bom dia", desc: "Mão direita no peito e abre para cima" },
  { phrase: "Obrigado", desc: "Mão fechada no queixo abre para frente" },
  { phrase: "Por favor", desc: "Mãos abertas fazendo movimento circular no peito" },
  { phrase: "Desculpa", desc: "Mão fechada esfrega o peito em movimento circular" },
  { phrase: "Sim", desc: "Mão fechada balançando para cima e para baixo" },
  { phrase: "Não", desc: "Mão aberta balançando de um lado para o outro" },
  { phrase: "Beleza", desc: "Mão aberta desliza pela bochecha" },
  { phrase: "Agendar", desc: "Mãos fechadas uma sobre a outra abrindo" },
  { phrase: "Preço", desc: "Mão fechada esfrega o polegar nos dedos" },
];

export default function AjudaLibras() {
  const [, navigate] = useLocation();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Hand className="h-6 w-6 text-blue-600" />
            Central de Ajuda - Libras
          </h1>
          <p className="text-sm text-muted-foreground">
            Aprenda o alfabeto e sinais básicos da Língua Brasileira de Sinais
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <Volume2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Dica:</strong> Navegue pelas abas abaixo para aprender o alfabeto,
          números e frases básicas em Libras. Cada sinal possui uma ilustração
          da configuração das mãos com a descrição dos movimentos.
        </div>
      </div>

      <Tabs defaultValue="alphabet" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alphabet">Alfabeto</TabsTrigger>
          <TabsTrigger value="numbers">Números</TabsTrigger>
          <TabsTrigger value="phrases">Frases</TabsTrigger>
        </TabsList>

        <TabsContent value="alphabet" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {alphabetLibra.map((item) => {
              const hasImage = HAS_IMAGE[item.letter];
              return (
                <Card key={item.letter} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-1 pt-3 px-3">
                    <CardTitle className="text-center">
                      <span className="text-xl font-bold text-blue-600">{item.letter}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 text-center">
                    <div className="w-16 h-16 mx-auto mb-2">
                      {hasImage ? (
                        <img
                          src={signImagePath(item.letter)}
                          alt={`Sinal de ${item.letter} em Libras`}
                          className="w-full h-full object-contain rounded"
                          loading="lazy"
                        />
                      ) : (
                        getAlphabetSign(item.letter, "#2563eb")
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-tight">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="numbers" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {numbersLibra.map((item) => (
              <Card key={item.number} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-3 px-3">
                  <CardTitle className="text-center">
                    <span className="text-xl font-bold text-green-600">{item.number}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 text-center">
                  <div className="w-16 h-16 mx-auto mb-2">
                    <img
                      src={`/image/libras/numeros/${item.number}.jpg`}
                      alt={`Número ${item.number} em Libras`}
                      className="w-full h-full object-contain rounded"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="phrases" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {phrasesLibra.map((item) => (
              <Card key={item.phrase} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 px-4 pb-4">
                  <h3 className="font-semibold text-base">{item.phrase}</h3>
                  <p className="text-xs text-muted-foreground leading-tight mt-1">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Vídeos de Apoio - Libras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://www.youtube.com/watch?v=8hnL2W5fDPg"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                <img
                  src="https://img.youtube.com/vi/8hnL2W5fDPg/mqdefault.jpg"
                  alt="Apoio Comercial em Libras"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-3 group-hover:bg-red-600 transition-colors">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="p-3 flex items-center gap-2 text-sm font-medium">
                <span>Apoio Comercial</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </div>
            </a>
            <a
              href="https://www.youtube.com/watch?v=NJU2vYoWrrI"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                <img
                  src="https://img.youtube.com/vi/NJU2vYoWrrI/mqdefault.jpg"
                  alt="Apoio em Libras"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-3 group-hover:bg-red-600 transition-colors">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="p-3 flex items-center gap-2 text-sm font-medium">
                <span>Alfabeto em Libras</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </div>
            </a>
            <a
              href="https://www.youtube.com/watch?v=yat_mbtbE9k"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                <img
                  src="https://img.youtube.com/vi/yat_mbtbE9k/mqdefault.jpg"
                  alt="Apoio em Libras"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-3 group-hover:bg-red-600 transition-colors">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="p-3 flex items-center gap-2 text-sm font-medium">
                <span>Sinais em Libras</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-600" />
            Sobre a Acessibilidade em Libras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            A Língua Brasileira de Sinais (Libras) é a língua materna da comunidade surda brasileira,
            reconhecida pela Lei nº 10.436/2002. Este sistema oferece recursos de acessibilidade
            para garantir que pessoas surdas possam utilizar todas as funcionalidades do BizFlow Access.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Interface visual</strong> - Ícones intuitivos e navegação simplificada</li>
            <li><strong>Alto contraste</strong> - Modo de alto contraste disponível nas configurações</li>
            <li><strong>Texto alternativo</strong> - Todas as imagens possuem descrição textual</li>
            <li><strong>Atalhos de teclado</strong> - Navegação completa sem uso do mouse</li>
          </ul>
          <p className="text-xs">
            Precisa de ajuda? Entre em contato pelo chat de suporte ou email:
            acessibilidade@bizflow.com
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}
