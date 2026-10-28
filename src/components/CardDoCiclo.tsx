import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, StyleSheet, View } from 'react-native';

import { cores, espaco, padding, raio } from '@/constants/tema';
import type { CicloComProgresso } from '@/hooks/useDadosHoje';
import { useCronometro } from '@/store/cronometro';
import { useToast } from '@/store/toast';
import { estadoDaMateria, formatarHoras, pluralizar } from '@/utils/hoje';
import { BrilhoDisco } from './BrilhoDisco';
import { DiscoCiclo } from './DiscoCiclo';
import { LinhaMateria } from './LinhaMateria';
import { Botao } from './ui/Botao';
import { Pilula } from './ui/Pilula';
import { Texto } from './ui/Texto';

type Props = CicloComProgresso & { onAbrirCiclo: () => void };

/** Card do ciclo ativo da aba Hoje: Disco, próxima etapa, ações e matérias. */
export function CardDoCiclo({ ciclo, progresso, onAbrirCiclo }: Props) {
  const db = useSQLiteContext();
  const { sessao, pronto, ocupado, iniciar } = useCronometro();
  const mostrarToast = useToast((s) => s.mostrar);
  const proxima = progresso.proximaEtapa;
  const iniciarCronometro = () => {
    iniciar(db, ciclo.id).catch(() => mostrarToast('Não foi possível iniciar o cronômetro.'));
  };
  return (
    <View style={estilos.card}>
      <View style={estilos.hero}>
        <BrilhoDisco />
        <DiscoCiclo
          etapas={progresso.etapas}
          proximaEtapaId={proxima?.id ?? null}
          volta={ciclo.voltaAtual}
          falta={formatarHoras(progresso.minutosFaltantes)}
        />
      </View>

      <View style={estilos.lado}>
        <View style={estilos.ciclo}>
          <View style={estilos.pilulas}>
            <Pilula texto={`Volta ${ciclo.voltaAtual}`} cor="azul" />
            <Pilula texto={pluralizar(progresso.etapas.length, 'etapa', 'etapas')} />
            <Pilula texto={pluralizar(progresso.etapasConcluidas, 'concluída', 'concluídas')} cor="verde" />
          </View>
          <Pressable accessibilityRole="link" accessibilityLabel={`Abrir ciclo ${ciclo.nome}`} onPress={onAbrirCiclo}>
            <Texto estilo="tituloDestaque">{ciclo.nome}</Texto>
          </Pressable>
        </View>

        {proxima ? (
          <View>
            <Texto estilo="lista14" cor={cores.ink2}>
              Próxima etapa
            </Texto>
            <Texto estilo="tituloDestaque">{proxima.materia}</Texto>
            <Texto estilo="lista14" cor={cores.ink2}>
              {`${formatarHoras(proxima.minutosFeitos)} de ${formatarHoras(proxima.minutos)} nesta volta.`}
            </Texto>
          </View>
        ) : null}

        <View style={estilos.acoes}>
          <Botao
            rotulo="Iniciar cronômetro"
            style={estilos.acao}
            onPress={iniciarCronometro}
            desabilitado={!pronto || ocupado || !!sessao || !proxima}
          />
          <Botao
            rotulo="Registrar estudo"
            variante="secundario"
            style={estilos.acao}
            onPress={() => router.push('/registrar-estudo')}
          />
        </View>

        <View>
          {progresso.materias.map((m) => (
            <LinhaMateria key={m.chaveMateria} materia={m} estado={estadoDaMateria(m, proxima)} />
          ))}
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.lg,
  },
  hero: {
    alignItems: 'center',
    padding: padding.hero,
    backgroundColor: cores.surface2,
    borderBottomWidth: 1,
    borderBottomColor: cores.line,
  },
  lado: { gap: espaco[14], padding: padding.hero },
  ciclo: { gap: espaco[12] },
  pilulas: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco[6] },
  acoes: {
    flexDirection: 'row',
    gap: espaco[8],
    paddingTop: espaco[2],
    paddingBottom: padding.card,
    borderBottomWidth: 1,
    borderBottomColor: cores.line,
  },
  acao: { flex: 1, paddingHorizontal: espaco[12] },
});
