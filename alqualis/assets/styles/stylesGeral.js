import {StyleSheet} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const stylesGeral = StyleSheet.create({
dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  dropdownWrapper: {
    flex: 1,
  },
  menuButton: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupMenu: {
    position: 'absolute',
    right: 10,
    top: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  popupItem: {
    paddingVertical: 8,
    flexDirection: 'row',
  },
    textPopup:{
    fontSize: RFValue(15)
  }

}) ;

    
export default stylesGeral;