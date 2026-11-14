import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { cores, espaco, raio } from '@/constants/tema';
import { carregarDadosDeExemplo } from '@/services/database';
import { useToast } from '@/store/toast';
import { useVersaoDados } from '@/store/versaoDados';
import { DialogoConfirmacao } from './ui/DialogoConfirmacao';
import { useCronometro } from '@/store/cronometro';
import { Icone } from './ui/Icone';
import { Texto } from './ui/Texto';

const TOQUES_PARA_EXEMPLO = 5;

export function Marca() {
  const db = useSQLiteContext();
  const [confirmando, setConfirmando] = useState(false);
  const toques = useRef({ n: 0, ultimo: 0 });

  const carregar = () => {
    setConfirmando(false);
    carregarDadosDeExemplo(db)
      .then(() => {
        useVersaoDados.getState().subir();
        void useCronometro.getState().hidratar(db);
        useToast.getState().mostrar('Dados de exemplo carregados');
      })
      .catch(() => useToast.getState().mostrar('Falha ao carregar dados de exemplo'));
  };

  // Só em desenvolvimento: 5 toques seguidos carregam os dados de exemplo.
  const aoTocar = () => {
    if (!__DEV__) return;
    const agora = Date.now();
    const t = toques.current;
    t.n = agora - t.ultimo < 1000 ? t.n + 1 : 1;
    t.ultimo = agora;
    if (t.n < TOQUES_PARA_EXEMPLO) return;
    t.n = 0;
    void db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM ciclos').then((r) => {
      if (r && r.n > 0) setConfirmando(true);
      else void carregar();
    });
  };

  return (
    <>
    <Pressable accessibilityRole="button" accessibilityLabel="Estudo Livre" onPress={aoTocar} style={estilos.marca}>
      <View style={estilos.logo}>
        <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
          <Path
            d="M8 2.46154C9.0338 2.46118 10.0471 2.75016 10.9251 3.2958C11.8032 3.84144 12.5111 4.62194 12.9686 5.549C13.4261 6.47606 13.6149 7.51266 13.5139 8.5415C13.4128 9.57035 13.0258 10.5504 12.3966 11.3707C11.7675 12.191 10.9213 12.8188 9.95379 13.1831C8.98631 13.5475 7.93618 13.6337 6.92222 13.4322C5.90826 13.2307 4.97094 12.7493 4.21633 12.0427C3.46172 11.3361 2.91995 10.4324 2.65231 9.43385"
            stroke={cores.onAccent}
            strokeWidth={2.46154}
          />
        </Svg>
      </View>
      <Texto estilo="marca17">
        Estudo <Texto estilo="marca17" cor={cores.accentInk}>Livre</Texto>
      </Texto>
    </Pressable>
    <DialogoConfirmacao
      visivel={confirmando}
      tom="perigo"
      titulo="Apagar tudo?"
      mensagem="Já existem dados no app. Para carregar o exemplo, todos os ciclos, etapas e registros atuais serão apagados."
      rotuloConfirmar="Apagar e carregar"
      onConfirmar={carregar}
      onCancelar={() => setConfirmando(false)}
    />
    </>
  );
}

type Props = { lembreteAtivo?: boolean; mostrarSino?: boolean };

export function Cabecalho({ lembreteAtivo = false, mostrarSino = true }: Props) {
  return (
    <View style={estilos.cabecalho}>
      <Marca />
      {mostrarSino ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir lembretes"
          onPress={() => router.push('/lembretes' as never)}
          style={estilos.sino}
        >
          <Icone nome="sino" />
          {lembreteAtivo ? <View style={estilos.indicador} /> : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espaco[16],
    paddingVertical: espaco[10],
    backgroundColor: cores.paper,
    borderBottomWidth: 1,
    borderBottomColor: cores.line,
  },
  marca: { flexDirection: 'row', alignItems: 'center', gap: espaco[10] },
  logo: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.accent,
    borderRadius: raio.control,
  },
  sino: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19 },
  indicador: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: cores.green, borderWidth: 1, borderColor: cores.paper },
});
