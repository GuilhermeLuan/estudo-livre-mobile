import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { cores, espaco, raio } from '@/constants/tema';
import { Texto } from './ui/Texto';

export function Marca() {
  return (
    <View style={estilos.marca}>
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
    </View>
  );
}

export function Cabecalho() {
  return (
    <View style={estilos.cabecalho}>
      <Marca />
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    height: 54,
    justifyContent: 'center',
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
});
