import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, Download } from "lucide-react";
import { generateSalePDF } from "@/lib/pdfUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function HistoryPage() {
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const salesQuery = trpc.sales.list.useQuery();
  const saleDetailsQuery = trpc.sales.getById.useQuery(
    { id: selectedSaleId || 0 },
    { enabled: selectedSaleId !== null }
  );

  const sales = salesQuery.data || [];

  const formatCurrency = (value: number) => {
    return (value / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const handleViewDetails = (saleId: number) => {
    setSelectedSaleId(saleId);
    setShowDetailsModal(true);
  };

  const handleExportPDF = async () => {
    if (!saleDetailsQuery.data) {
      toast.error("Carregando dados da venda...");
      return;
    }

    const sale = saleDetailsQuery.data;
    const saleRecord = sales.find(s => s.id === sale.id);

    if (!saleRecord) {
      toast.error("Dados do cliente nao encontrados");
      return;
    }

    try {
      generateSalePDF({
        id: sale.id,
        customerName: saleRecord.customerName || "Cliente",
        customerEmail: saleRecord.customerEmail || "",
        customerPhone: saleRecord.customerPhone || "",
        customerCpf: saleRecord.customerCpf || "",
        totalAmount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        installments: sale.installments,
        amountReceived: sale.amountReceived || undefined,
        change: sale.change || undefined,
        items: (sale.items || []).map((item: any) => ({
          productId: item.productId,
          name: item.productId.toString(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        createdAt: sale.createdAt,
      });
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Historico de Vendas</h1>

      {sales.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 text-lg">Nenhuma venda realizada ainda.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold">ID</th>
                <th className="p-4 text-left font-semibold">Data</th>
                <th className="p-4 text-left font-semibold">Cliente</th>
                <th className="p-4 text-left font-semibold">Total</th>
                <th className="p-4 text-left font-semibold">Pagamento</th>
                <th className="p-4 text-left font-semibold">Parcelas</th>
                <th className="p-4 text-right font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold">#{sale.id}</td>
                  <td className="p-4">{formatDate(sale.createdAt)}</td>
                  <td className="p-4">{sale.customerName}</td>
                  <td className="p-4 font-semibold">{formatCurrency(sale.totalAmount)}</td>
                  <td className="p-4 capitalize">
                    {sale.paymentMethod === "pix" && "PIX"}
                    {sale.paymentMethod === "cartao" && "Cartao"}
                    {sale.paymentMethod === "dinheiro" && "Dinheiro"}
                  </td>
                  <td className="p-4">{sale.installments}x</td>
                  <td className="p-4 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(sale.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" /> Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda #{selectedSaleId}</DialogTitle>
          </DialogHeader>

          {saleDetailsQuery.isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando detalhes...</p>
            </div>
          ) : saleDetailsQuery.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Data</p>
                  <p className="text-lg">{formatDate(saleDetailsQuery.data.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Total</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(saleDetailsQuery.data.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Itens da Venda</h3>
                <div className="space-y-2">
                  {saleDetailsQuery.data.items && saleDetailsQuery.data.items.length > 0 ? (
                    saleDetailsQuery.data.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Produto #{item.productId}</span>
                        <span>
                          {item.quantity}x {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Nenhum item encontrado</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Forma de Pagamento</p>
                    <p className="text-lg capitalize">
                      {saleDetailsQuery.data.paymentMethod === "pix" && "PIX"}
                      {saleDetailsQuery.data.paymentMethod === "cartao" && "Cartao"}
                      {saleDetailsQuery.data.paymentMethod === "dinheiro" && "Dinheiro"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Parcelas</p>
                    <p className="text-lg">{saleDetailsQuery.data.installments}x</p>
                  </div>
                </div>

                {saleDetailsQuery.data.paymentMethod === "dinheiro" && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Valor Recebido</p>
                      <p className="text-lg">{formatCurrency(saleDetailsQuery.data.amountReceived || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Troco</p>
                      <p className="text-lg">{formatCurrency(saleDetailsQuery.data.change || 0)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Dados nao encontrados</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Fechar
            </Button>
            <Button onClick={handleExportPDF} disabled={saleDetailsQuery.isLoading}>
              <Download className="w-4 h-4 mr-2" /> Exportar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
