import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';
import DropdownComponent from './DropDownComponent';
import stylesGeral from '../../assets/styles/stylesGeral';

/**
 * Componente de label reutilizável com input ou dropdown, vertical ou horizontal.
 *
 * @param {string} label - Texto exibido como label.
 * @param {boolean} input - Se verdadeiro, exibe um TextInput.
 * @param {boolean} dropdown - Se verdadeiro, exibe um Dropdown.
 * @param {boolean} horizontal - Exibe o label e input na horizontal.
 * @param {string|null} icon - Nome do ícone do Ionicons.
 * @param {function|null} onIconPress - Função chamada ao pressionar o ícone.
 * @param {string} value - Valor exibido no TextInput.
 * @param {function} onChangeText - Função ao mudar o texto do input.
 */
export default function Label({
  label = 'Label',
  input = false,
  dropdown = false,
  horizontal = false,
  icon = null,
  onIconPress = null,
  value = '',
  onChangeText = () => {},
  data,
}) {
  if (horizontal) {
    return (
      <View style={styles.horizontalRow}>
        <Text style={styles.labelHorizontal}>{label}</Text>
        <View style={styles.inputHorizontalContainer}>
          <TextInput
            style={styles.input}
            placeholder={label}
            value={value}
            onChangeText={onChangeText}
          />
          {icon && (
            <Ionicons
              name={icon}
              size={RFValue(20)}
              color="#000"
              style={styles.icon}
              onPress={onIconPress}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {input && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={label}
            value={value}
            onChangeText={onChangeText}
          />
          {icon && (
            <Ionicons
              name={icon}
              size={RFValue(20)}
              color="#000"
              style={styles.icon}
              onPress={onIconPress}
            />
          )}
        </View>
      )}

      {dropdown && (
        <View style={stylesGeral.dropdownRow}>
          <View style={stylesGeral.dropdownWrapper}>
            <DropdownComponent
            label={label}
            data={data}
            onChange={onChangeText} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: RFValue(5),
    width: '90%',
    alignSelf: 'center',
  },
  label: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    marginBottom: RFValue(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    height: RFValue(35),
    borderWidth: RFValue(1),
    borderColor: '#000',
    borderRadius: RFValue(8),
    paddingHorizontal: RFValue(12),
    backgroundColor: '#fff',
  },
  icon: {
    marginLeft: RFValue(10),
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: RFValue(8),
  },
  labelHorizontal: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    marginRight: RFValue(10),
    minWidth: RFValue(100),
  },
  inputHorizontalContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
