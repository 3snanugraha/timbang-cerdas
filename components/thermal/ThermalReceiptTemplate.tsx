import React from "react";
import { Text, View } from "react-native";
import { Transaction } from "../../services/DatabaseService";

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

export const formatCurrency = (
  amount: number,
  symbol: string = "Rp",
  separator: string = "."
) => {
  // Ensure amount is a valid number
  const validAmount = isNaN(amount) ? 0 : amount;

  // Format number with proper locale and replace decimal separator
  const formattedNumber = validAmount
    .toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    .replace(/,/g, separator);

  return `${symbol} ${formattedNumber}`;
};

export const formatDate = (
  dateString: string,
  format: string = "DD/MM/YYYY",
  showTime: boolean = false
) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  let formattedDate = format
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", year.toString());

  if (showTime) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    formattedDate += ` ${hours}:${minutes}`;
  }

  return formattedDate;
};

const ThermalReceiptTemplate: React.FC<ThermalReceiptProps> = ({
  transaction,
  settings,
  isPreview = false,
}) => {
  const textStyle = {
    fontSize: isPreview ? 13 : 11,
    fontFamily: "monospace",
    color: "#000",
    lineHeight: isPreview ? 16 : 14,
  };

  const boldTextStyle = {
    ...textStyle,
    fontWeight: "bold" as const,
  };

  const centerTextStyle = {
    ...textStyle,
    textAlign: "center" as const,
  };

  const centerBoldTextStyle = {
    ...boldTextStyle,
    textAlign: "center" as const,
  };

  // Safe render functions
  const renderCustomerSection = () => {
    if (!settings.show_customer || !transaction.customer_name) {
      return null;
    }
    return (
      <Text style={textStyle}>
        Customer: {transaction.customer_name}
      </Text>
    );
  };

  const renderAdminSection = () => {
    if (!settings.show_admin || !transaction.admin_name) {
      return null;
    }
    return (
      <Text style={textStyle}>
        Admin : {transaction.admin_name}
      </Text>
    );
  };

  const renderNotesSection = () => {
    if (!settings.show_notes || !transaction.catatan || !transaction.catatan.trim()) {
      return null;
    }
    return (
      <>
        <Text style={{
          ...textStyle,
          textAlign: "center",
          fontStyle: "italic",
          fontSize: isPreview ? 11 : 9,
          marginVertical: 4
        }}>
          Catatan: {transaction.catatan}
        </Text>
        <Text style={{ ...textStyle, textAlign: "center", marginVertical: 8 }}>
          --------------------------------
        </Text>
      </>
    );
  };

  const hasCustomerOrAdmin = () => {
    return (settings.show_customer && transaction.customer_name) ||
           (settings.show_admin && transaction.admin_name);
  };

  return (
    <View
      style={{
        backgroundColor: isPreview ? "#f9fafb" : "white",
        padding: isPreview ? 20 : 12,
        borderRadius: isPreview ? 8 : 0,
        width: isPreview ? "100%" : 384,
        minHeight: isPreview ? 450 : 350,
      }}
    >
      <Text
        style={{
          ...centerBoldTextStyle,
          fontSize: isPreview ? 10 : 8,
          marginBottom: 8,
        }}
      >
        ================================
      </Text>

      <Text
        style={{
          ...centerBoldTextStyle,
          fontSize: isPreview ? 16 : 14,
          marginBottom: 4,
        }}
      >
        {settings.company_name}
      </Text>

      <Text
        style={{
          ...centerTextStyle,
          fontSize: isPreview ? 12 : 10,
          marginBottom: 2,
        }}
      >
        {settings.company_address}
      </Text>

      <Text
        style={{
          ...centerTextStyle,
          fontSize: isPreview ? 12 : 10,
          marginBottom: 8,
        }}
      >
        HP: {settings.company_phone}
      </Text>

      <Text
        style={{
          ...centerBoldTextStyle,
          fontSize: isPreview ? 10 : 8,
          marginBottom: 8,
        }}
      >
        ================================
      </Text>

      <Text style={textStyle}>
        Tanggal : {formatDate(
          transaction.transaction_date,
          settings.date_format,
          settings.show_time
        )}
      </Text>

      <Text style={textStyle}>Barang : {transaction.jenis_barang}</Text>

      <Text style={textStyle}>
        Bruto : {transaction.bruto_kg.toLocaleString("id-ID")} Kg
      </Text>
      <Text style={textStyle}>
        Tare : {transaction.tare_kg.toLocaleString("id-ID")} Kg
      </Text>
      <Text style={textStyle}>
        Netto : {transaction.netto_kg.toLocaleString("id-ID")} Kg
      </Text>

      {transaction.pot_percentage > 0 && (
        <Text style={textStyle}>Pot (%) : {transaction.pot_percentage}%</Text>
      )}
      {transaction.pot_kg > 0 && (
        <Text style={textStyle}>
          Pot (Kg) : {transaction.pot_kg.toLocaleString("id-ID")} Kg
        </Text>
      )}

      <Text style={textStyle}>
        Total : {transaction.total_kg.toLocaleString("id-ID")} Kg
      </Text>

      <Text style={textStyle}>
        Harga : {formatCurrency(
          transaction.harga_per_kg,
          settings.currency_symbol,
          settings.thousand_separator
        )}
      </Text>

      <Text
        style={{
          ...boldTextStyle,
          fontSize: isPreview ? 14 : 12,
          marginVertical: 4,
        }}
      >
        Jumlah Uang: {formatCurrency(
          transaction.total_harga,
          settings.currency_symbol,
          settings.thousand_separator
        )}
      </Text>

      <Text style={{ ...textStyle, textAlign: "center", marginVertical: 8 }}>
        --------------------------------
      </Text>

      {renderCustomerSection()}
      {renderAdminSection()}

      {hasCustomerOrAdmin() && (
        <Text style={{ ...textStyle, textAlign: "center", marginVertical: 8 }}>
          --------------------------------
        </Text>
      )}

      {renderNotesSection()}

      <Text
        style={{
          ...centerBoldTextStyle,
          fontSize: isPreview ? 10 : 8,
          marginTop: 8,
        }}
      >
        ================================
      </Text>

      <Text
        style={{
          ...centerBoldTextStyle,
          fontSize: isPreview ? 14 : 12,
          marginVertical: 8,
        }}
      >
        ~ {settings.footer_text} ~
      </Text>

      <Text
        style={{
          ...centerBoldTextStyle,
          fontSize: isPreview ? 10 : 8,
          marginTop: 4,
        }}
      >
        ================================
      </Text>
    </View>
  );
};

export default ThermalReceiptTemplate;