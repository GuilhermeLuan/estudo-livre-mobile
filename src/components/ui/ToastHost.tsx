import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { espaco } from '@/constants/tema';
import { useToast } from '@/store/toast';
import { Toast } from './Toast';

const DURACAO_MS = 2500;
/** Distância do rodapé: fica acima da barra inferior das abas. */
const ACIMA_DA_BARRA = 96;

/** Mostra o toast global por alguns segundos, acima de qualquer tela. */
export function ToastHost() {
  const { bottom } = useSafeAreaInsets();
  const mensagem = useToast((s) => s.mensagem);
  const esconder = useToast((s) => s.esconder);

  useEffect(() => {
    if (!mensagem) return;
    const t = setTimeout(esconder, DURACAO_MS);
    return () => clearTimeout(t);
  }, [mensagem, esconder]);

  if (!mensagem) return null;
  return (
    <View pointerEvents="none" style={[estilos.host, { bottom: bottom + ACIMA_DA_BARRA }]}>
      <Toast mensagem={mensagem} />
    </View>
  );
}

const estilos = StyleSheet.create({
  host: { position: 'absolute', left: espaco[16], right: espaco[16], alignItems: 'center' },
});
