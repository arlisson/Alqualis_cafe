// components/LoadingOverlay.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';

/**
 * 
 * @param {*} visible Visibilidade do modal
 * @param {*} message Mensagem a ser exibida
 * @returns 
 */
export default function Carregando({ visible, message = "Importando dados..." }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#333',
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});
