import React from 'react';
import { ScrollView, StyleSheet, View, SafeAreaView } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

/**
 * Container com ScrollView que centraliza seus filhos.
 * Permite rolagem quando o conteúdo ultrapassa a altura da tela,
 * sem cobrir os botões de navegação do celular.
 *
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Elementos filhos a serem exibidos centralizados
 *
 * @returns {JSX.Element}
 */
export default function ViewCenter({ children }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%' }}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    
  },
  container: {
    justifyContent: 'center',   // Centraliza verticalmente
    alignItems: 'center',       // Centraliza horizontalmente    
    padding: RFValue(16),
    paddingBottom: RFValue(30),         // Ajuste para não cobrir a parte inferior, onde ficam os botões
  },
});
