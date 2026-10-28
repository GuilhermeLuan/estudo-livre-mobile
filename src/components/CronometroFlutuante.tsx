import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { cores, espaco, raio, sombras } from '@/constants/tema';
import { buscarCiclo, listarEtapas, listarRegistrosDoCiclo } from '@/services/database';
import { useCronometro } from '@/store/cronometro';
import { useToast } from '@/store/toast';
import { formatarCronometro, tempoDecorridoMs } from '@/utils/tempoCronometro';
import { proximaEtapa } from '@/utils/proximaEtapa';
import { Botao } from './ui/Botao';
import { Texto } from './ui/Texto';

type Props = { distanciaInferior: number };

export function CronometroFlutuante({ distanciaInferior }: Props) {
  const db = useSQLiteContext();
  const { sessao, ocupado, pausar, retomar, descartar, hidratar } = useCronometro();
  const mostrarToast = useToast((s) => s.mostrar);
  const [agora, setAgora] = useState(0);
  const [cicloNome, setCicloNome] = useState('');
  const [materia, setMateria] = useState('');

  useEffect(() => {
    if (!sessao || sessao.pausadoEm !== null) return;
    const primeiro = setTimeout(() => setAgora(Date.now()), 0);
    const intervalo = setInterval(() => setAgora(Date.now()), 1000);
    return () => { clearTimeout(primeiro); clearInterval(intervalo); };
  }, [sessao]);

  useEffect(() => {
    if (!sessao) return;
    let ativo = true;
    (async () => {
      const ciclo = await buscarCiclo(db, sessao.cicloId);
      if (!ciclo) {
        await hidratar(db);
        return;
      }
      const [etapas, registros] = await Promise.all([
        listarEtapas(db, ciclo.id),
        listarRegistrosDoCiclo(db, ciclo.id, ciclo.voltaAtual),
      ]);
      if (ativo) {
        setCicloNome(ciclo.nome);
        setMateria((proximaEtapa(etapas, registros) ?? etapas[0])?.materia ?? '');
      }
    })().catch(() => mostrarToast('Não foi possível carregar o cronômetro.'));
    return () => { ativo = false; };
  }, [db, sessao, hidratar, mostrarToast]);

  if (!sessao) return null;
  const tempo = tempoDecorridoMs(sessao, agora);
  const executar = (acao: Promise<void>) => acao.catch(() => mostrarToast('Não foi possível atualizar o cronômetro.'));
  const parar = async () => {
    try {
      await pausar(db);
      router.push('/registrar-sessao');
    } catch {
      mostrarToast('Não foi possível parar o cronômetro.');
    }
  };

  return (
    <View style={[estilos.card, { bottom: distanciaInferior }]}>
      <View style={estilos.linhaSuperior}>
        <Texto estilo="cronometro24" cor={cores.accentInk} style={sessao.pausadoEm !== null && estilos.pausado}>
          {formatarCronometro(tempo)}
        </Texto>
        <View style={estilos.identificacao}>
          <Texto estilo="lista14Forte" numberOfLines={1}>{materia}</Texto>
          <Texto estilo="meta13" cor={cores.ink2} numberOfLines={1}>{cicloNome}</Texto>
        </View>
      </View>
      <View style={estilos.acoes}>
        <Botao
          rotulo={sessao.pausadoEm === null ? 'Pausar' : 'Retomar'}
          variante="secundario"
          style={estilos.pausar}
          desabilitado={ocupado}
          onPress={() => executar(sessao.pausadoEm === null ? pausar(db) : retomar(db))}
        />
        <Botao rotulo="Parar e registrar" style={estilos.parar} desabilitado={ocupado} onPress={parar} />
        <Botao rotulo="Descartar" variante="discreto" style={estilos.descartar} desabilitado={ocupado} onPress={() => executar(descartar(db))} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    position: 'absolute', left: 12, right: 12, minHeight: 119, zIndex: 10,
    paddingHorizontal: espaco[16], paddingVertical: espaco[14], gap: espaco[12],
    backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.accent,
    borderRadius: raio.lg, ...sombras.cronometro,
  },
  linhaSuperior: { flexDirection: 'row', alignItems: 'center', gap: espaco[14] },
  identificacao: { flex: 1 },
  pausado: { opacity: 0.6 },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pausar: { flex: 1, paddingHorizontal: 4 },
  parar: { flex: 1.9, paddingHorizontal: 4 },
  descartar: { flex: 1.1, paddingHorizontal: 0 },
});
