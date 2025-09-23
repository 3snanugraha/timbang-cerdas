import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { Transaction } from '../../services/DatabaseService';
import { ThermalSettings, formatCurrency, formatDate } from './ThermalReceiptTemplate';

export interface PrintOptions {
  transaction: Transaction;
  settings: ThermalSettings;
  shouldShare?: boolean;
  filename?: string;
}

class ThermalPrintService {


  // Generate simple test HTML
  private generateSimpleHTML(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: monospace; padding: 10px; }
  </style>
</head>
<body>
  <h1>Test Receipt</h1>
  <p>This is a test</p>
</body>
</html>`;
  }

  // Generate HTML for thermal receipt using best practices - NO TEMPLATE LITERALS
  private generateReceiptHTML(transaction: Transaction, settings: ThermalSettings): string {
    console.log('generateReceiptHTML called with transaction:', {
      id: transaction.id,
      customer_name: transaction.customer_name,
      total_harga: transaction.total_harga
    });

    // Simple, reliable formatters
    const formatMoney = (amount: number): string => {
      const validAmount = isNaN(amount) ? 0 : amount;
      return 'Rp ' + validAmount.toLocaleString('id-ID');
    };

    const formatWeight = (weight: number): string => {
      return weight.toLocaleString('id-ID', {minimumFractionDigits: 0, maximumFractionDigits: 2});
    };

    const formatSimpleDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID');
    };

    // Build content sections using string concatenation
    let potPercentageSection = '';
    if (transaction.pot_percentage > 0) {
      potPercentageSection = '<tr><td>Pot (%)</td><td>:</td><td>' + transaction.pot_percentage + '%</td></tr>';
    }

    let potKgSection = '';
    if (transaction.pot_kg > 0) {
      potKgSection = '<tr><td>Pot (Kg)</td><td>:</td><td>' + formatWeight(transaction.pot_kg) + ' Kg</td></tr>';
    }

    let adminSection = '';
    if (settings.show_admin) {
      adminSection = '<tr><td>Admin</td><td>:</td><td>' + transaction.admin_name + '</td></tr>';
    }

    let customerSection = '';
    if (settings.show_customer) {
      customerSection = '<tr><td>Customer</td><td>:</td><td>' + transaction.customer_name + '</td></tr>';
    }

    let notesSection = '';
    if (settings.show_notes && transaction.catatan) {
      notesSection = '<tr><td colspan="3" style="padding-top:5px;font-style:italic;">Catatan: ' + transaction.catatan + '</td></tr>';
    }

    // Build HTML using string concatenation
    let html = '<!DOCTYPE html>\n';
    html += '<html>\n';
    html += '<head>\n';
    html += '  <meta charset="utf-8">\n';
    html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">\n';
    html += '  <style>\n';
    html += '    * {\n';
    html += '      margin: 0;\n';
    html += '      padding: 0;\n';
    html += '      font-family: \'Courier New\', monospace;\n';
    html += '      font-size: 12px;\n';
    html += '    }\n';
    html += '    body {\n';
    html += '      width: 155px;\n';
    html += '      max-width: 155px;\n';
    html += '      padding: 5px;\n';
    html += '      background: white;\n';
    html += '      color: black;\n';
    html += '    }\n';
    html += '    .center {\n';
    html += '      text-align: center;\n';
    html += '    }\n';
    html += '    .bold {\n';
    html += '      font-weight: bold;\n';
    html += '    }\n';
    html += '    .separator {\n';
    html += '      border-top: 1px dashed black;\n';
    html += '      margin: 3px 0;\n';
    html += '      width: 100%;\n';
    html += '    }\n';
    html += '    table {\n';
    html += '      width: 100%;\n';
    html += '      border-collapse: collapse;\n';
    html += '      margin: 2px 0;\n';
    html += '    }\n';
    html += '    td {\n';
    html += '      padding: 1px 2px;\n';
    html += '      vertical-align: top;\n';
    html += '    }\n';
    html += '    .total-row {\n';
    html += '      font-weight: bold;\n';
    html += '      font-size: 13px;\n';
    html += '      padding-top: 2px;\n';
    html += '    }\n';
    html += '  </style>\n';
    html += '</head>\n';
    html += '<body>\n';
    html += '  <div class="center bold">================================</div>\n';
    html += '  <div class="center bold">' + settings.company_name + '</div>\n';
    html += '  <div class="center">' + settings.company_address + '</div>\n';
    html += '  <div class="center">HP: ' + settings.company_phone + '</div>\n';
    html += '  <div class="center bold">================================</div>\n';
    html += '  <table>\n';
    html += '    <tr><td>Tanggal</td><td>:</td><td>' + formatSimpleDate(transaction.transaction_date) + '</td></tr>\n';
    html += '    <tr><td>Barang</td><td>:</td><td>' + transaction.jenis_barang + '</td></tr>\n';
    html += '    <tr><td>Bruto</td><td>:</td><td>' + formatWeight(transaction.bruto_kg) + ' Kg</td></tr>\n';
    html += '    <tr><td>Tare</td><td>:</td><td>' + formatWeight(transaction.tare_kg) + ' Kg</td></tr>\n';
    html += '    <tr><td>Netto</td><td>:</td><td>' + formatWeight(transaction.netto_kg) + ' Kg</td></tr>\n';
    html += '    ' + potPercentageSection + '\n';
    html += '    ' + potKgSection + '\n';
    html += '    <tr><td>Total</td><td>:</td><td>' + formatWeight(transaction.total_kg) + ' Kg</td></tr>\n';
    html += '    <tr><td>Harga</td><td>:</td><td>' + formatMoney(transaction.harga_per_kg) + '</td></tr>\n';
    html += '    <tr class="total-row"><td>Jumlah</td><td>:</td><td>' + formatMoney(transaction.total_harga) + '</td></tr>\n';
    html += '  </table>\n';
    html += '  <div class="separator"></div>\n';
    html += '  <table>\n';
    html += '    ' + adminSection + '\n';
    html += '    ' + customerSection + '\n';
    html += '  </table>\n';
    html += '  <div class="separator"></div>\n';
    html += '  <div class="center">' + settings.footer_text + '</div>\n';
    if (notesSection) {
      html += '  <table>\n';
      html += '    ' + notesSection + '\n';
      html += '  </table>\n';
    }
    html += '</body>\n';
    html += '</html>';

    return html;
  }

  // Print thermal receipt directly
  async printReceipt(options: PrintOptions): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Direct thermal print requested...');
      const html = this.generateReceiptHTML(options.transaction, options.settings);

      // Select a printer (optional, opens a picker)
      // const printer = await Print.selectPrinterAsync();

      await Print.printAsync({
        html,
        // printerUrl: printer?.url, // Use selected printer
        width: 155, // Corresponds to 58mm paper width, adjust as needed
      });

      console.log('Print job sent successfully');
      return {
        success: true,
        message: 'Struk berhasil dikirim ke printer'
      };

    } catch (error) {
      console.error('Direct print error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide a more user-friendly error message
      if (errorMessage.includes('print is not available')) {
        return {
          success: false,
          message: 'Pencetakan tidak tersedia di perangkat ini.'
        };
      }
      
      return {
        success: false,
        message: `Gagal mencetak: ${errorMessage}`
      };
    }
  }

  // Generate and share PDF
  async generateAndSharePDF(options: PrintOptions): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Starting PDF generation...');

      // Use complex HTML now that we know PDF generation works
      console.log('Using complex HTML for receipt...');
      const html = this.generateReceiptHTML(options.transaction, options.settings);
      console.log('Generated HTML length:', html.length);
      console.log('HTML preview:', html.substring(0, 100));

      console.log('Calling Print.printToFileAsync...');

      // Generate PDF with simplified options
      const pdfPromise = Print.printToFileAsync({
        html,
        base64: false,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
      );

      const result = await Promise.race([pdfPromise, timeoutPromise]) as { uri: string; numberOfPages: number; base64?: string };
      console.log('PDF generation result:', result);

      const { uri } = result;
      console.log('PDF generated successfully:', uri);

      // Check file size
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        console.log('PDF file size:', blob.size, 'bytes');
      } catch (e) {
        console.log('Could not check file size:', e);
      }

      // For sharing, we'll use the original URI from expo-print
      // The PDF is already generated in a temporary location that can be shared
      const finalUri = uri;

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return {
          success: false,
          message: 'Sharing tidak tersedia pada perangkat ini'
        };
      }

      // Share the PDF
      console.log('Sharing PDF...');
      await Sharing.shareAsync(finalUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Bagikan Struk PDF',
        UTI: 'com.adobe.pdf',
      });

      console.log('PDF shared successfully');
      return {
        success: true,
        message: 'PDF berhasil dibuat dan dibagikan'
      };

    } catch (error) {
      console.error('PDF generation error:', error);

      if (error instanceof Error && error.message === 'PDF generation timeout') {
        return {
          success: false,
          message: 'Proses pembuatan PDF timeout. Silakan coba lagi.'
        };
      }

      return {
        success: false,
        message: 'Gagal membuat PDF. Silakan coba lagi.'
      };
    }
  }

  // Preview receipt data (for modal display)
  getReceiptPreviewData(transaction: Transaction, settings: ThermalSettings) {
    return {
      transaction,
      settings,
      formattedData: {
        date: formatDate(transaction.transaction_date, settings.date_format, settings.show_time),
        totalAmount: formatCurrency(transaction.total_harga, settings.currency_symbol, settings.thousand_separator),
        pricePerKg: formatCurrency(transaction.harga_per_kg, settings.currency_symbol, settings.thousand_separator),
      }
    };
  }

  // Show print preview with options
  async showPrintPreview(options: PrintOptions): Promise<{ action: 'print' | 'pdf' | 'cancel' }> {
    return new Promise((resolve) => {
      const customerName = options.transaction.customer_name;
      const amount = formatCurrency(options.transaction.total_harga, options.settings.currency_symbol, options.settings.thousand_separator);
      
      Alert.alert(
        'Preview Struk',
        `Customer: ${customerName}\nTotal: ${amount}\n\nPilih aksi yang ingin dilakukan:`,
        [
          {
            text: 'Batal',
            style: 'cancel',
            onPress: () => resolve({ action: 'cancel' })
          },
          {
            text: 'Cetak',
            onPress: () => resolve({ action: 'print' })
          },
          {
            text: 'Simpan PDF',
            onPress: () => resolve({ action: 'pdf' })
          }
        ]
      );
    });
  }

  // Test with simple HTML first
  async testSimplePDF(): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Testing simple PDF generation...');

      const html = this.generateSimpleHTML();
      console.log('Simple HTML generated:', html);

      const { uri } = await Print.printToFileAsync({
        html,
        width: 80,
        height: undefined,
        base64: false,
      });

      console.log('Simple PDF generated at:', uri);

      // Try to share it
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      }

      return {
        success: true,
        message: 'Test PDF berhasil dibuat'
      };
    } catch (error) {
      console.error('Test PDF error:', error);
      return {
        success: false,
        message: `Test PDF gagal: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Debug method to test HTML generation
  debugHTML(transaction: Transaction, settings: ThermalSettings): string {
    return this.generateReceiptHTML(transaction, settings);
  }
}

export default new ThermalPrintService();
