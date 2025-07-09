import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';
import DropdownComponent from './DropDownComponent';
import stylesGeral from '../../assets/styles/stylesGeral';

/**
 * Componente reutilizável de campo com label, podendo ser:
 * - input de texto normal
 * - dropdown de seleção
 * - input somente leitura com seleção via modal
 *
 * @param {string} label - Texto exibido acima do campo
 * @param {boolean} input - Exibe TextInput normal
 * @param {boolean} dropdown - Exibe Dropdown com lista de seleção
 * @param {boolean} selectableInput - Exibe campo readonly com modal de seleção
 * @param {boolean} horizontal - Layout horizontal (label ao lado)
 * @param {string|null} icon - Ícone ao lado do campo (somente para `input`)
 * @param {function|null} onIconPress - Ação ao pressionar ícone
 * @param {string} value - Valor do campo
 * @param {function} onChangeText - Função para atualizar o valor
 * @param {array} data - Dados do dropdown
 * @param {string} mainIconName - Nome do Ionicon principal (para `selectableInput`)
 * @param {function} onPressMainIcon - Ação ao pressionar o ícone principal
 * @param {JSX.Element|null} extraIcon - Ícone extra (ex: botão de limpar)
 * @param {boolean} modalVisible - Visibilidade do modal (para `selectableInput`)
 * @param {function} setModalVisible - Função para alterar a visibilidade do modal
 * @param {function} renderModalContent - Conteúdo personalizado do modal
 */
export default function Label({
  label = 'Label',
  input = false,
  dropdown = false,
  selectableInput = false,
  horizontal = false,
  icon = null,
  onIconPress = null,
  value = '',
  onChangeText = () => {},
  data = [],
  mainIconName = null,
  onPressMainIcon = null,
  extraIcon = null,
  modalVisible = false,
  setModalVisible = () => {},
  renderModalContent = null,
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
              value={value}
              onChange={onChangeText}
            />
          </View>
        </View>
      )}

      {selectableInput && (
        <>
          <View style={styles.inputIconContainer}>
            <View style={{ flex: 1, overflow: 'hidden' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TextInput
                  style={styles.inputReadonly}
                  placeholder={label}
                  value={value}
                  editable={false}
                  scrollEnabled={false}
                />
              </ScrollView>
            </View>

            {mainIconName && (
              <TouchableOpacity onPress={onPressMainIcon}>
                <Ionicons name={mainIconName} size={RFValue(20)} color="#000" />
              </TouchableOpacity>
            )}

            {extraIcon}
          </View>

          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{`Selecione ${label}`}</Text>
                {renderModalContent && renderModalContent()}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.btnFechar}
                >
                  <Text style={{ color: 'white' }}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
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
    fontSize: RFValue(14),
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
  inputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: RFValue(10),
    backgroundColor: '#fff',
    height: RFValue(40),
    justifyContent: 'space-between',
  },
  inputReadonly: {
    flex: 1,
    fontSize: RFValue(14),
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 30,
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    marginBottom: 10,
  },
  btnFechar: {
    marginTop: 10,
    backgroundColor: '#4CAF50',    
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
});
