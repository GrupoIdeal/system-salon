import { Hand, Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const alphabetLibra = [
  { letter: "A", sign: "🤟", desc: "Mão fechada com polegar estendido para cima" },
  { letter: "B", sign: "🤚", desc: "Mão aberta com dedos estendidos" },
  { letter: "C", sign: "🖐️", desc: "Mão formando formato de C" },
  { letter: "D", sign: "☝️", desc: "Mão fechada com indicador levantado" },
  { letter: "E", sign: "✋", desc: "Mão aberta com polegar sobre os dedos" },
  { letter: "F", sign: "🤏", desc: "Mão fechada com polegar e indicador se tocando" },
  { letter: "G", sign: "✊", desc: "Mão fechada, polegar estendido para frente" },
  { letter: "H", sign: "✌️", desc: "Mão fechada com indicador e médio estendidos" },
  { letter: "I", sign: "🤙", desc: "Mão fechada com mindinho levantado" },
  { letter: "J", sign: "👉", desc: "Mão fechada com mindinho fazendo curva" },
  { letter: "K", sign: "🤞", desc: "Mão fechada com indicador e médio levantados" },
  { letter: "L", sign: "👍", desc: "Mão fechada com polegar e indicador estendidos em L" },
  { letter: "M", sign: "🤟", desc: "Polegar sob os dedos indicador, médio e anelar" },
  { letter: "N", sign: "🤘", desc: "Polegar sob indicador e médio" },
  { letter: "O", sign: "🫰", desc: "Dedos formando círculo" },
  { letter: "P", sign: "🖖", desc: "Mão aberta voltada para baixo" },
  { letter: "Q", sign: "👇", desc: "Polegar e indicador estendidos para baixo" },
  { letter: "R", sign: "🤞", desc: "Indicador e médio cruzados" },
  { letter: "S", sign: "🤛", desc: "Mão fechada" },
  { letter: "T", sign: "✊", desc: "Mão fechada com polegar entre indicador e médio" },
  { letter: "U", sign: "✌️", desc: "Indicador e médio estendidos para cima" },
  { letter: "V", sign: "✌️", desc: "Indicador e médio abertos em V" },
  { letter: "W", sign: "🤟", desc: "Indicador, médio e anelar estendidos" },
  { letter: "X", sign: "✊", desc: "Mão fechada com indicador curvado" },
  { letter: "Y", sign: "🤙", desc: "Polegar e mindinho estendidos" },
  { letter: "Z", sign: "✍️", desc: "Mão fazendo movimento de Z no ar" },
];

const numbersLibra = [
  { number: "0", sign: "🫰", desc: "Dedos formando círculo" },
  { number: "1", sign: "☝️", desc: "Indicador levantado" },
  { number: "2", sign: "✌️", desc: "Indicador e médio levantados" },
  { number: "3", sign: "🤟", desc: "Polegar, indicador e médio levantados" },
  { number: "4", sign: "🖐️", desc: "Quatro dedos levantados (polegar escondido)" },
  { number: "5", sign: "✋", desc: "Mão aberta" },
  { number: "6", sign: "🤙", desc: "Mão fechada, polegar toca mindinho" },
  { number: "7", sign: "🤙", desc: "Polegar toca anelar" },
  { number: "8", sign: "🤙", desc: "Polegar toca médio" },
  { number: "9", sign: "🤙", desc: "Polegar toca indicador" },
];

const phrasesLibra = [
  { phrase: "Olá", sign: "👋", desc: "Mão aberta balançando de um lado para o outro" },
  { phrase: "Bom dia", sign: "🌅", desc: "Mão direita aberta toca o peito e abre para cima" },
  { phrase: "Obrigado", sign: "🤝", desc: "Mão fechada no queixo abre para frente" },
  { phrase: "Por favor", sign: "🤲", desc: "Mãos abertas fazendo movimento circular no peito" },
  { phrase: "Desculpa", sign: "🙏", desc: "Mão fechada esfrega o peito em movimento circular" },
  { phrase: "Sim", sign: "👌", desc: "Mão fechada balançando para cima e para baixo" },
  { phrase: "Não", sign: "✋", desc: "Mão aberta balançando de um lado para o outro" },
  { phrase: "Beleza", sign: "💅", desc: "Mão aberta desliza pela bochecha" },
  { phrase: "Agendar", sign: "📅", desc: "Mãos fechadas uma sobre a outra abrindo" },
  { phrase: "Preço", sign: "💰", desc: "Mão fechada esfrega o polegar nos dedos" },
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
          números e frases básicas em Libras. Cada sinal é representado por um emoji
          ilustrativo com a descrição dos movimentos das mãos.
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
            {alphabetLibra.map((item) => (
              <Card key={item.letter} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-center">
                    <span className="text-2xl font-bold text-blue-600">{item.letter}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 text-center">
                  <div className="text-4xl mb-2">{item.sign}</div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="numbers" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {numbersLibra.map((item) => (
              <Card key={item.number} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-center">
                    <span className="text-2xl font-bold text-green-600">{item.number}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 text-center">
                  <div className="text-4xl mb-2">{item.sign}</div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="phrases" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {phrasesLibra.map((item) => (
              <Card key={item.phrase} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 px-4 pb-4 flex items-center gap-4">
                  <div className="text-4xl shrink-0">{item.sign}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.phrase}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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
