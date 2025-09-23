import React from 'react';
import { View, Text } from 'react-native';
import { Transaction } from '../../services/DatabaseService';

export interface ThermalSettings {
  company_name: string;
  company_address: string;
  company_phone: string;
  footer_text: string;
  show_admin: boolean;
  show_customer: boolean;
  show_notes: boolean;
  currency_symbol: string;
  thousand_separator: string;
  date_format: string;
  show_time: boolean;
}

export interface ThermalReceiptProps {
  transaction: Transaction;
  settings: ThermalSettings;
  isPreview?: boolean;
}

export const formatCurrency = (amount: number, symbol: string = 'Rp', separator: string = '.') => {
  // Ensure amount is a valid number
  const validAmount = isNaN(amount) ? 0 : amount;

  // Format number with proper locale and replace decimal separator
  const formattedNumber = validAmount.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).replace(/,/g, separator);

  return `${symbol} ${formattedNumber}`;
};

export const formatDate = (dateString: string, format: string = 'DD/MM/YYYY', showTime: boolean = false) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  let formattedDate = format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year.toString());
  
  if (showTime) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    formattedDate += ` ${hours}:${minutes}`;
  }
  
  return formattedDate;
};

const ThermalReceiptTemplate: React.FC<ThermalReceiptProps> = ({ 
  transaction, 
  settings, 
  isPreview = false 
}) => {
  const textStyle = {
    fontSize: isPreview ? 12 : 10,
    fontFamily: 'monospace',
    color: '#000',
    lineHeight: isPreview ? 14 : 12,
  };

  const boldTextStyle = {
    ...textStyle,
    fontWeight: 'bold' as const,
  };

  const centerTextStyle = {
    ...textStyle,
    textAlign: 'center' as const,
  };

  const centerBoldTextStyle = {
    ...boldTextStyle,
    textAlign: 'center' as const,
  };

  return (
    <View style={{ 
      backgroundColor: isPreview ? '#f9fafb' : 'white',
      padding: isPreview ? 16 : 8,
      borderRadius: isPreview ? 8 : 0,
      width: isPreview ? '100%' : 384, // 58mm thermal paper width in pixels
    }}>
      {/* Header Separator */}
      <Text style={centerBoldTextStyle}>
        ================================
      </Text>
      
      {/* Company Name */}
      <Text style={centerBoldTextStyle}>
        {settings.company_name}
      </Text>
      
      {/* Company Address */}
      <Text style={centerTextStyle}>
        {settings.company_address}
      </Text>
      
      {/* Company Phone */}
      <Text style={centerTextStyle}>
        HP: {settings.company_phone}
      </Text>
      
      {/* Header Separator */}
      <Text style={centerBoldTextStyle}>
        ================================
      </Text>
      
      {/* Transaction Date */}
      <Text style={textStyle}>
        Tanggal    : {formatDate(transaction.transaction_date, settings.date_format, settings.show_time)}
      </Text>
      
      {/* Product Type */}
      <Text style={textStyle}>
        Barang     : {transaction.jenis_barang}
      </Text>
      
      {/* Weight Information */}
      <Text style={textStyle}>
        Bruto      : {transaction.bruto_kg.toLocaleString('id-ID')} Kg
      </Text>
      <Text style={textStyle}>
        Tare       : {transaction.tare_kg.toLocaleString('id-ID')} Kg
      </Text>
      <Text style={textStyle}>
        Netto      : {transaction.netto_kg.toLocaleString('id-ID')} Kg
      </Text>
      
      {/* Deduction Information */}
      {transaction.pot_percentage > 0 && (
        <Text style={textStyle}>
          Pot (%)    : {transaction.pot_percentage}%
        </Text>
      )}
      {transaction.pot_kg > 0 && (
        <Text style={textStyle}>
          Pot (Kg)   : {transaction.pot_kg.toLocaleString('id-ID')} Kg
        </Text>
      )}
      
      {/* Final Weight */}
      <Text style={textStyle}>
        Total      : {transaction.total_kg.toLocaleString('id-ID')} Kg
      </Text>
      
      {/* Price Information */}
      <Text style={textStyle}>
        Harga      : {formatCurrency(transaction.harga_per_kg, settings.currency_symbol, settings.thousand_separator)}
      </Text>
      
      {/* Total Amount */}
      <Text style={boldTextStyle}>
        Jumlah Uang: {formatCurrency(transaction.total_harga, settings.currency_symbol, settings.thousand_separator)}
      </Text>
      
      {/* Separator */}
      <Text style={textStyle}>
        --------------------------------
      </Text>
      
      {/* Admin Information */}
      {settings.show_admin && (
        <Text style={textStyle}>
          Admin        : {transaction.admin_name}
        </Text>
      )}
      
      {/* Customer Information */}
      {settings.show_customer && (
        <Text style={textStyle}>
          Customer/Sopir: {transaction.customer_name}
        </Text>
      )}
      
      {/* Separator */}
      <Text style={textStyle}>
        --------------------------------
      </Text>
      
      {/* Footer Text */}
      <Text style={centerTextStyle}>
        {settings.footer_text}
      </Text>
      
      {/* Notes */}
      {settings.show_notes && transaction.catatan && (
        <>
          <Text style={textStyle}>Catatan:</Text>
          <Text style={textStyle}>{transaction.catatan}</Text>
        </>
      )}
    </View>
  );
};

export default ThermalReceiptTemplate;
