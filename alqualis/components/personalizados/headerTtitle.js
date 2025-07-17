import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Cor from '../../constants/Cores';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';


/**
 * HeaderTitle
 * 
 * Componente de cabeçalho reutilizável com título centralizado
 * e ícones opcionais de navegação (voltar e home).
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.texto - Texto a ser exibido como título centralizado (padrão: 'Título')
 * @param {boolean} props.voltar - Se verdadeiro, exibe o botão de voltar (router.back())
 * @param {boolean} props.home - Se verdadeiro, exibe o botão de home (router.push('/'))
 * 
 * @returns {JSX.Element} Um cabeçalho estilizado com título e ícones opcionais
 * 
 * @example
 * <HeaderTitle texto="Gestão do Café" voltar='true' home='false' />
 */
export default function HeaderTitle({
  texto = 'Título',
  voltar = false,
  home = false,
}) {
  return (
    <View style={styles.header}>
      {/* Ícone de Voltar */}
      <View style={styles.iconLeft}>
        {voltar && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={RFValue(20)} color="#F3E8DF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Título centralizado */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{texto}</Text>
      </View>

      {/* Ícone de Home */}
      <View style={styles.iconRight}>
        {home && (
          <TouchableOpacity onPress={() => router.push('/')}>
            <Ionicons name="home" size={RFValue(20)} color="#F3E8DF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Cor.marrom,
    paddingTop: RFValue(40),
    paddingBottom: RFValue(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    paddingHorizontal: 16,
  },
  iconLeft: {
    width: RFValue(40),
    alignItems: 'flex-start',
  },
  iconRight: {
    width: RFValue(40),
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    
  },
  title: {
    color: '#F3E8DF',
    fontSize: RFValue(18),
    fontWeight: 'bold',
    textAlign:'center'
  },
});
