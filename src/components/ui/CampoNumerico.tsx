import { Campo } from './Campo';

type Props = {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  digitos: number;
  placeholder?: string;
  desabilitado?: boolean;
};

/** Campo que só aceita dígitos, com limite de tamanho. */
export function CampoNumerico({ rotulo, valor, onChange, digitos, placeholder = '0', desabilitado }: Props) {
  return (
    <Campo
      tipo="texto"
      rotulo={rotulo}
      valor={valor}
      onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, digitos))}
      keyboardType="number-pad"
      placeholder={placeholder}
      maxLength={digitos}
      desabilitado={desabilitado}
    />
  );
}
