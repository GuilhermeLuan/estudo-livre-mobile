import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToast } from '@/store/toast';
import { Toast } from './Toast';

const DURACAO_MS = 2500;

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
    <View pointerEvents="none" style={[estilos.host, { bottom: bottom + 96 }]}>
      <Toast mensagem={mensagem} />
    </View>
  );
}

const estilos = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
});
