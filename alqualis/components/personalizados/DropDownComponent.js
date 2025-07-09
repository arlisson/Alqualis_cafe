import React, { useState,useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { RFValue } from 'react-native-responsive-fontsize';

  // const data = [
  //   { label: 'Item 1', value: '1' },
  //   { label: 'Item 2', value: '2' },
  //   { label: 'Item 3', value: '3' },
  //   { label: 'Item 4', value: '4' },
  //   { label: 'Item 5', value: '5' },
  //   { label: 'Item 6', value: '6' },
  //   { label: 'Item 7', value: '7' },
  //   { label: 'Item 8', value: '8' },
  // ];

  const DropdownComponent = ({ data = [], label = 'Selecionar', onChange, value }) => {
  const [isFocus, setIsFocus] = useState(false);
  const [internalValue, setInternalValue] = useState(value?.value || null); // valor primitivo do objeto

  useEffect(() => {
    // Sempre que o objeto mudar, atualiza o valor com seu .value
    setInternalValue(value?.value || null);
  }, [value]);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Selecionar ' + label : '...'}
        searchPlaceholder="Buscar..."
        value={internalValue} // apenas o .value
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setInternalValue(item.value);    // atualiza o valor exibido
          onChange(item);                  // envia o objeto completo { label, value }
          setIsFocus(false);
        }}
      />
    </View>
  );
};


  export default DropdownComponent;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      borderRadius: RFValue(8),
      //padding: RFValue(1),
      
    },
    dropdown: {
      height: RFValue(40),
      borderColor: '#000',
      borderWidth: 1,
      borderRadius: RFValue(8),
      paddingHorizontal: RFValue(8),
    },   
    label: {
      position: 'absolute',
      backgroundColor: 'white',      
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: RFValue(14),
    },
    placeholderStyle: {
      fontSize: RFValue(14),
    },
    selectedTextStyle: {
      fontSize: RFValue(14),
    },  
    inputSearchStyle: {
      height: RFValue(35),
      fontSize: RFValue(14),
    },
  });