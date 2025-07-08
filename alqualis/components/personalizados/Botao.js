import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import Cores from '../../constants/Cores';

/**
 * Botão reutilizável com ícone opcional e texto centralizado.
 *
 * @param {function} onPress - Ação ao pressionar
 * @param {string} texto - Texto exibido
 * @param {boolean} icone - Se deve mostrar o ícone
 * @param {string} foto - Nome do ícone Ionicons
 */
export default function Botao({ onPress, texto = 'Novo Botão', icone = true, foto = 'add-circle-outline' }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.innerContent}>
        {icone && (
          <Ionicons name={foto} size={RFValue(20)} color="#fff" style={styles.icon} />
        )}
        <Text style={styles.text}>{texto}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Cores.marrom,
    paddingVertical: RFValue(10),
    paddingHorizontal: RFValue(20),
    borderRadius: 12,
    marginVertical: RFValue(15),
    elevation: 3,
    width: '90%',
    alignSelf: 'center',
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: RFValue(14),
  },
});
