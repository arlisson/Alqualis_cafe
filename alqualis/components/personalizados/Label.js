import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';
import DropdownComponent from './DropDownComponent';
import stylesGeral from '../../assets/styles/stylesGeral';

/**
 * Componente reutilizável de campo com label:
 * - input comum
 * - dropdown
 * - input somente leitura com seleção múltipla interna via modal
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
  modalVisible: externalModalVisible = null,
  setModalVisible: externalSetModalVisible = null,
  renderModalContent = null,
  options = [], // para uso interno do selectableInput
}) {
  const [internalModalVisible, setInternalModalVisible] = useState(false);
 
  const isExternal = Array.isArray(value) && typeof onChangeText === 'function';
  const [internalSelectedItems, setInternalSelectedItems] = useState([]);
  const selectedItems = isExternal ? value : internalSelectedItems;
  const setSelectedItems = isExternal ? onChangeText : setInternalSelectedItems;


  const modalVisible = externalModalVisible ?? internalModalVisible;
  const setModalVisible = externalSetModalVisible ?? setInternalModalVisible;

  const handleToggleItem = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleClearAll = () => setSelectedItems([]);

  const internalModalContent = () => (
    <>
      <FlatList
        data={options}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleToggleItem(item)}
            style={{ paddingVertical: 10 }}
          >
            <Text style={{ color: selectedItems.includes(item) ? 'blue' : 'black' }}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity onPress={handleClearAll} style={{ marginTop: 10 }}>
        <Text style={{ color: '#cc0000', textAlign: 'center' }}>Limpar Todos</Text>
      </TouchableOpacity>
    </>
  );

  const displayValue = Array.isArray(selectedItems) ? selectedItems.join(', ') : '';


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
                  value={displayValue}
                  editable={false}
                  scrollEnabled={false}
                />
              </ScrollView>
            </View>
            {mainIconName && (
              <TouchableOpacity onPress={onPressMainIcon ?? (() => setModalVisible(true))}>
                <Ionicons name={mainIconName} size={RFValue(20)} color="#000" />
              </TouchableOpacity>
            )}
            {Array.isArray(selectedItems) && selectedItems.length > 0 && (
              extraIcon ?? (
                <TouchableOpacity
                  onPress={() => setSelectedItems((prev) => prev.slice(0, -1))}
                  style={{ marginLeft: 10 }}
                >
                  <Ionicons name="backspace-outline" size={20} color="#cc0000" />
                </TouchableOpacity>
              )
            )}

          </View>

          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{`Selecione ${label}`}</Text>
                {(renderModalContent || internalModalContent)()}
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnFechar}>
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
