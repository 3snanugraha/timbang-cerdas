import { Transaction } from '../../services/DatabaseService';

export const generateTransactionExportHTML = (transactions: Transaction[], startDate: string, endDate: string): string => {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total_harga, 0);
  const totalWeight = transactions.reduce((sum, t) => sum + t.total_kg, 0);

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const transactionRows = transactions.map(t => `
    <tr>
      <td>${formatDate(t.transaction_date)}</td>
      <td>${t.customer_name}</td>
      <td>${t.jenis_barang}</td>
      <td class="text-right">${t.total_kg.toLocaleString('id-ID')} kg</td>
      <td class="text-right">${formatCurrency(t.harga_per_kg)}</td>
      <td class="text-right">${formatCurrency(t.total_harga)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Laporan Transaksi</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 12px;
          color: #333;
        }
        .container {
          padding: 20px;
        }
        h1, h2, h3 {
          margin: 0;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .summary {
          margin-bottom: 20px;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 15px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-item h3 {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .summary-item p {
          font-size: 16px;
          font-weight: bold;
          margin: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f7f7f7;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .text-right {
          text-align: right;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 10px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Laporan Transaksi</h1>
          <p>Periode: ${formatDate(startDate)} - ${formatDate(endDate)}</p>
        </div>

        <div class="summary">
          <div class="summary-grid">
            <div class="summary-item">
              <h3>Total Transaksi</h3>
              <p>${transactions.length}</p>
            </div>
            <div class="summary-item">
              <h3>Total Berat</h3>
              <p>${totalWeight.toLocaleString('id-ID')} kg</p>
            </div>
            <div class="summary-item">
              <h3>Total Pendapatan</h3>
              <p>${formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Customer</th>
              <th>Barang</th>
              <th class="text-right">Berat</th>
              <th class="text-right">Harga/Kg</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows}
          </tbody>
        </table>

        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          <p>Timbang Cerdas</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
