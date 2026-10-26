import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CardCicloCompacto } from '@/components/CardCicloCompacto';
import { CardDoCiclo } from '@/components/CardDoCiclo';
import { Botao } from '@/components/ui/Botao';
import { EstadoVazio } from '@/components/ui/EstadoVazio';
import { Texto } from '@/components/ui/Texto';
import { cores, espaco, padding } from '@/constants/tema';
import { useDadosHoje } from '@/hooks/useDadosHoje';
import { formatarDataExtensa, porcentagemDaVolta } from '@/utils/hoje';

const abrirCiclo = (id: number) => router.push({ pathname: '/ciclos/[id]', params: { id } });
const novoCiclo = () => router.push('/ciclos/novo');

export default function Hoje() {
  const dados = useDadosHoje();
  const ativo = dados?.cicloAtivo;

  return (
    <ScrollView style={{ backgroundColor: cores.paper }} contentContainerStyle={estilos.conteudo}>
      {dados ? (
        <>
          <Texto estilo="tituloH1">
            {'Seu ciclo de hoje  '}
            <Texto estilo="meta13" cor={cores.ink2}>
              {formatarDataExtensa(dados.hoje)}
            </Texto>
          </Texto>
          {ativo ? (
            <>
              <CardDoCiclo {...ativo} onAbrirCiclo={() => abrirCiclo(ativo.ciclo.id)} />
              <View style={estilos.outros}>
                <View style={estilos.tituloOutros}>
                  <Texto estilo="tituloH2">Outros ciclos</Texto>
                  <Botao rotulo="Novo ciclo" variante="discreto" onPress={novoCiclo} />
                </View>
                {dados.outrosCiclos.map(({ ciclo, progresso }) => (
                  <CardCicloCompacto
                    key={ciclo.id}
                    nome={ciclo.nome}
                    resumo={
                      progresso.proximaEtapa
                        ? `Volta ${ciclo.voltaAtual}. Próxima: ${progresso.proximaEtapa.materia}`
                        : `Volta ${ciclo.voltaAtual}`
                    }
                    porcentagem={porcentagemDaVolta(progresso)}
                    onPress={() => abrirCiclo(ciclo.id)}
                  />
                ))}
              </View>
            </>
          ) : (
            <EstadoVazio
              titulo="Nenhum ciclo ainda"
              texto="Crie um ciclo para montar sua rotina de estudo."
              rotuloAcao="Criar primeiro ciclo"
              onAcao={novoCiclo}
            />
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { gap: espaco[24], paddingTop: espaco[20], paddingHorizontal: espaco[16], paddingBottom: padding.fimDaTela },
  outros: { gap: espaco[12] },
  tituloOutros: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espaco[12] },
});
