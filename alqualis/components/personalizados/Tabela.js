// components/personalizados/Tabela.js

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import { RFValue } from 'react-native-responsive-fontsize';

export default function Tabela({ header = [], data = [] }) {
  return (
    <ScrollView horizontal>
      <View style={styles.container}>
        <Table borderStyle={{ borderWidth: 1, borderColor: '#ccc' }}>
          <Row
            data={header}
            style={styles.head}
            textStyle={styles.textHead}
          />
          <Rows
            data={data}
            style={styles.row}
            textStyle={styles.textRow}
          />
        </Table>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: RFValue(10),
    marginHorizontal: RFValue(15),
  },
  head: {
    height: RFValue(40),
    backgroundColor: '#f1f8ff',
  },
  textHead: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: RFValue(13),
  },
  row: {
    height: RFValue(35),
  },
  textRow: {
    textAlign: 'center',
    fontSize: RFValue(12),
  },
});
