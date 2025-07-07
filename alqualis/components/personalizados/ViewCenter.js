import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

/**
 * Container com ScrollView que centraliza seus filhos.
 * Permite rolagem quando o conteúdo ultrapassa a altura da tela.
 *
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Elementos filhos a serem exibidos centralizados
 *
 * @returns {JSX.Element}
 */
export default function Centralizado({ children }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{width:'100%'}}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                 // necessário para centralizar em ScrollView
    justifyContent: 'center',   // centraliza verticalmente
    alignItems: 'center',       // centraliza horizontalmente    
    padding: 16,
  },
});
