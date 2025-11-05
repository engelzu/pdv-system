// @ts-nocheck
import jsPDF from "jspdf";

interface SaleItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SaleData {
  id: number;
  customerName: string | null | undefined;
  customerEmail: string | null | undefined;
  customerPhone: string | null | undefined;
  customerCpf: string | null | undefined;
  totalAmount: number;
  paymentMethod: string;
  installments: number;
  amountReceived?: number | null;
  change?: number | null;
  items: SaleItem[];
  createdAt: Date;
}

export function generateSalePDF(sale: SaleData) {
  const doc = new jsPDF();
  
  // Configuracoes
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  
  // Titulo
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("COMPROVANTE DE VENDA" as string, pageWidth / 2, yPosition, { align: "center" as any });
  yPosition += 10;
  
  // Numero e data da venda
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Venda #${sale.id}` as string, margin, yPosition);
  doc.text(`Data: ${new Date(sale.createdAt).toLocaleDateString("pt-BR")}` as string, pageWidth / 2, yPosition);
  yPosition += 8;
  
  // Separador
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  // Dados do cliente
  doc.setFont(undefined, "bold");
  doc.text("DADOS DO CLIENTE" as string, margin, yPosition);
  yPosition += 6;
  
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  const customerName = String(sale.customerName || "");
  const customerCpf = String(sale.customerCpf || "");
  const customerEmail = String(sale.customerEmail || "");
  const customerPhone = String(sale.customerPhone || "");
  doc.text(`Nome: ${customerName}` as string, margin, yPosition);
  yPosition += 5;
  doc.text(`CPF: ${customerCpf}` as string, margin, yPosition);
  yPosition += 5;
  doc.text(`Email: ${customerEmail}` as string, margin, yPosition);
  yPosition += 5;
  doc.text(`Telefone: ${customerPhone}` as string, margin, yPosition);
  yPosition += 8;
  
  // Separador
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  // Itens da venda
  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  doc.text("ITENS DA VENDA" as string, margin, yPosition);
  yPosition += 8;
  
  // Cabecalho da tabela
  doc.setFont(undefined, "bold");
  doc.setFontSize(9);
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition - 5, contentWidth, 6, "F");
  
  const colWidths = [80, 20, 25, 35];
  const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
  
  doc.text("Produto" as string, colPositions[0], yPosition);
  doc.text("Qtd" as string, colPositions[1], yPosition);
  doc.text("Valor Unit." as string, colPositions[2], yPosition);
  doc.text("Total" as string, colPositions[3], yPosition);
  yPosition += 8;
  
  // Itens
  doc.setFont(undefined, "normal");
  sale.items.forEach((item) => {
    const itemName = String(item.name || "");
    const productName = itemName.length > 30 ? itemName.substring(0, 27) + "..." : itemName;
    doc.text(productName as string, colPositions[0], yPosition);
    doc.text(item.quantity.toString() as string, colPositions[1], yPosition);
    doc.text(`R$ ${(item.unitPrice / 100).toFixed(2)}` as string, colPositions[2], yPosition);
    doc.text(`R$ ${(item.totalPrice / 100).toFixed(2)}` as string, colPositions[3], yPosition);
    yPosition += 6;
  });
  
  yPosition += 4;
  
  // Separador
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  // Resumo financeiro
  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  doc.text("RESUMO FINANCEIRO" as string, margin, yPosition);
  yPosition += 8;
  
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  
  // Total
  doc.text("Total da Venda:" as string, margin, yPosition);
  doc.text(`R$ ${(sale.totalAmount / 100).toFixed(2)}` as string, pageWidth - margin - 30, yPosition, { align: "right" as any });
  yPosition += 6;
  
  // Forma de pagamento
  const paymentMethods: Record<string, string> = {
    pix: "PIX",
    cartao: "Cartao de Credito",
    dinheiro: "Dinheiro",
  };
  
  const paymentLabel = paymentMethods[sale.paymentMethod] || "Desconhecido";
  doc.text(`Forma de Pagamento: ${paymentLabel}` as string, margin, yPosition);
  yPosition += 6;
  
  // Parcelas (se aplicavel)
  if (sale.installments > 1) {
    doc.text(`Parcelas: ${sale.installments}x de R$ ${(sale.totalAmount / sale.installments / 100).toFixed(2)}` as string, margin, yPosition);
    yPosition += 6;
  }
  
  // Troco (se dinheiro)
  if (sale.paymentMethod === "dinheiro" && sale.amountReceived !== undefined && sale.amountReceived !== null && sale.change !== undefined && sale.change !== null) {
    doc.text(`Valor Recebido: R$ ${((sale.amountReceived as number) / 100).toFixed(2)}` as string, margin, yPosition);
    yPosition += 5;
    doc.text(`Troco: R$ ${((sale.change as number) / 100).toFixed(2)}` as string, margin, yPosition);
    yPosition += 6;
  }
  
  yPosition += 8;
  
  // Separador
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  // Rodape
  doc.setFontSize(8);
  doc.setFont(undefined, "italic");
  doc.text("Obrigado pela compra! Volte sempre." as string, pageWidth / 2, pageHeight - 15, { align: "center" as any });
  
  // Salvar PDF
  doc.save(`venda-${sale.id}.pdf`);
}
