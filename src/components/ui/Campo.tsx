import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { cores, espaco, raio, textos } from '@/constants/tema';
import { Icone } from './Icone';
import { Texto } from './Texto';

type Base = {
  rotulo?: string;
  valor: string;
};

type Props =
  | (Base & { tipo: 'texto' | 'areaDeTexto'; onChangeText?: (v: string) => void; desabilitado?: boolean } & Pick<
        TextInputProps,
        'placeholder' | 'keyboardType' | 'maxLength'
      >)
  | (Base & { tipo: 'selecao'; onPress?: () => void; placeholder?: string })
  | (Base & { tipo: 'travado' });

export function Campo(props: Props) {
  const [focado, setFocado] = useState(false);
  const { rotulo, valor, tipo } = props;
  const editavel = (tipo === 'texto' || tipo === 'areaDeTexto') && !props.desabilitado;
  const area = tipo === 'areaDeTexto';

  const caixa = [
    estilos.entrada,
    { height: area ? 70 : 40, alignItems: area ? ('flex-start' as const) : ('center' as const) },
    tipo === 'travado' && { opacity: 0.6 },
    focado && estilos.foco,
  ];

  return (
    <View style={estilos.campo}>
      {rotulo ? (
        <Texto estilo="meta13Medio" cor={cores.ink2}>
          {rotulo}
        </Texto>
      ) : null}
      {tipo === 'texto' || area ? (
        <View style={caixa}>
          <TextInput
            value={valor}
            onChangeText={props.onChangeText}
            editable={editavel}
            multiline={area}
            placeholder={props.placeholder}
            placeholderTextColor={cores.ink2}
            keyboardType={props.keyboardType}
            maxLength={props.maxLength}
            onFocus={() => setFocado(true)}
            onBlur={() => setFocado(false)}
            style={[estilos.texto, area && { height: '100%', textAlignVertical: 'top' }, !editavel && { opacity: 0.6 }]}
          />
        </View>
      ) : (
        <Pressable
          accessibilityRole={tipo === 'selecao' ? 'button' : undefined}
          disabled={tipo === 'travado'}
          onPress={tipo === 'selecao' ? props.onPress : undefined}
          style={[...caixa, { flexDirection: 'row' }]}
        >
          <Texto estilo="lista14" style={estilos.texto} numberOfLines={1}>
            {valor || (tipo === 'selecao' ? props.placeholder : '')}
          </Texto>
          <Icone nome="setaAbaixo" tamanho={16} />
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { gap: espaco[6], width: '100%' },
  entrada: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: cores.paper,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.control,
    paddingHorizontal: espaco[12],
    paddingVertical: 8,
  },
  /** Foco: borda accent + halo accent-soft. */
  foco: { borderColor: cores.accent, boxShadow: `0 0 0 3px ${cores.accentSoft}` },
  texto: { flex: 1, color: cores.ink, padding: 0, ...textos.lista14 },
});
