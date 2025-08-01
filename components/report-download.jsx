"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  PieChart,
  BarChart3,
  Loader2
} from "lucide-react";
import { generateFinancialReport } from "@/actions/notifications";

export function ReportDownload({ accounts, transactions }) {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("monthly");

  const downloadReport = async (format) => {
    setLoading(true);
    try {
      const reportData = await generateFinancialReport(null, format);
      
      if (reportData.error) {
        throw new Error(reportData.error);
      }

      // Create downloadable content
      const content = generateReportContent(reportData, format);
      downloadFile(content, `financial-report-${Date.now()}.${format.toLowerCase()}`, format);
      
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateReportContent = (data, format) => {
    if (format === "JSON") {
      return JSON.stringify(data, null, 2);
    }
    
    if (format === "CSV") {
      let csv = "Account Name,Balance,Type,Transaction Count\n";
      data.accounts.forEach(account => {
        csv += `${account.name},${account.balance},${account.type},${account.transactionCount}\n`;
      });
      return csv;
    }

    // HTML format for PDF-like viewing
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .account { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; }
          .transaction { font-size: 12px; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Financial Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <p><strong>Total Balance:</strong> $${data.summary.totalBalance.toLocaleString()}</p>
          <p><strong>Total Accounts:</strong> ${data.summary.totalAccounts}</p>
          <p><strong>Total Transactions:</strong> ${data.summary.totalTransactions}</p>
        </div>
        
        <h2>Account Details</h2>
        ${data.accounts.map(account => `
          <div class="account">
            <h3>${account.name} (${account.type})</h3>
            <p><strong>Balance:</strong> $${account.balance.toLocaleString()}</p>
            <p><strong>Transactions:</strong> ${account.transactionCount}</p>
            <h4>Recent Transactions:</h4>
            ${account.recentTransactions.map(tx => `
              <div class="transaction">
                ${new Date(tx.date).toLocaleDateString()} - ${tx.description} - $${tx.amount}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </body>
      </html>
    `;
  };

  const downloadFile = (content, filename, format) => {
    const blob = new Blob([content], { 
      type: format === "CSV" ? "text/csv" : 
           format === "JSON" ? "application/json" : "text/html" 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reportTypes = [
    {
      id: "monthly",
      title: "Monthly Report",
      description: "Complete overview of this month's financial activity",
      icon: <Calendar className="h-5 w-5" />,
      badge: "Popular"
    },
    {
      id: "annual",
      title: "Annual Report",
      description: "Year-end financial summary and insights",
      icon: <BarChart3 className="h-5 w-5" />,
      badge: "Comprehensive"
    },
    {
      id: "transactions",
      title: "Transaction History",
      description: "Detailed list of all your transactions",
      icon: <FileText className="h-5 w-5" />,
      badge: "Detailed"
    },
    {
      id: "analytics",
      title: "Financial Analytics",
      description: "Advanced insights and spending patterns",
      icon: <PieChart className="h-5 w-5" />,
      badge: "Insights"
    }
  ];

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {reportTypes.map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                reportType === type.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setReportType(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {type.icon}
                    <h3 className="font-semibold">{type.title}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {type.badge}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Choose Format:</h4>
          <div className="flex gap-3">
            <Button 
              onClick={() => downloadReport("HTML")}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              HTML Report
            </Button>
            <Button 
              variant="outline" 
              onClick={() => downloadReport("CSV")}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV Data
            </Button>
            <Button 
              variant="outline" 
              onClick={() => downloadReport("JSON")}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              JSON Export
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Quick Stats</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Accounts</p>
              <p className="font-semibold">{accounts?.length || 0}</p>
            </div>
            <div>
              <p className="text-gray-600">Transactions</p>
              <p className="font-semibold">{transactions?.length || 0}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Balance</p>
              <p className="font-semibold">
                ${accounts?.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
