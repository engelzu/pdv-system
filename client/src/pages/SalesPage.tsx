import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Minus } from "lucide-react";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function SalesPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao" | "dinheiro">("pix");
  const [installments, setInstallments] = useState(1);
  const [amountReceived, setAmountReceived] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const customersQuery = trpc.customers.list.useQuery();
  const productsQuery = trpc.products.list.useQuery();
  const createSaleMutation = trpc.sales.create.useMutation();

  const customers = customersQuery.data || [];
  const products = productsQuery.data || [];

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const change = amountReceived - totalAmount;

  const handleAddToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price / 100,
        quantity: 1,
      }]);
    }
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedCustomerId) {
      toast.error("Selecione um cliente");
      return;
    }
    if (cart.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }
    if (paymentMethod === "dinheiro" && amountReceived < totalAmount) {
      toast.error("Valor recebido insuficiente");
      return;
    }

    setIsProcessing(true);
    try {
      await createSaleMutation.mutateAsync({
        customerId: parseInt(selectedCustomerId),
        totalAmount: Math.round(totalAmount * 100),
        paymentMethod,
        installments,
        amountReceived: paymentMethod === "dinheiro" ? Math.round(amountReceived * 100) : undefined,
        change: paymentMethod === "dinheiro" ? Math.round(change * 100) : undefined,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Math.round(item.price * 100),
          totalPrice: Math.round(item.price * item.quantity * 100),
        })),
      });

      toast.success("Venda realizada com sucesso!");
      setShowPaymentModal(false);
      setSelectedCustomerId("");
      setCart([]);
      setPaymentMethod("pix");
      setInstallments(1);
      setAmountReceived(0);
    } catch (error) {
      toast.error("Erro ao processar venda");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nova Venda</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">1. Selecionar Cliente</h2>
        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente..." />
          </SelectTrigger>
          <SelectContent>
            {customers.map(customer => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.name} - {customer.cpf}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">2. Adicionar Produtos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="border rounded-lg p-4 flex flex-col">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <h3 className="font-semibold mb-1">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-gray-600 mb-2 flex-1">{product.description}</p>
              )}
              <p className="text-lg font-bold text-blue-600 mb-3">
                R$ {(product.price / 100).toFixed(2)}
              </p>
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full"
              >
                Adicionar
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">3. Carrinho de Compras</h2>
        <div className="space-y-3 mb-4">
          {cart.length === 0 ? (
            <p className="text-gray-500">O carrinho esta vazio.</p>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveFromCart(item.productId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span className="text-blue-600">R$ {totalAmount.toFixed(2)}</span>
          </div>
        </div>
        <Button
          onClick={() => setShowPaymentModal(true)}
          disabled={cart.length === 0 || !selectedCustomerId}
          className="w-full"
          size="lg"
        >
          Finalizar Compra e Pagar
        </Button>
      </Card>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forma de Pagamento</DialogTitle>
          </DialogHeader>

          <Tabs value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pix">PIX</TabsTrigger>
              <TabsTrigger value="cartao">Cartao</TabsTrigger>
              <TabsTrigger value="dinheiro">Dinheiro</TabsTrigger>
            </TabsList>

            <TabsContent value="pix" className="space-y-4">
              <p className="text-center text-sm text-gray-600">
                Aponte a camera para o QR Code ou use o Copia e Cola.
              </p>
              <div className="bg-gray-100 p-4 rounded text-center">
                <p className="text-sm font-semibold">Total: R$ {totalAmount.toFixed(2)}</p>
              </div>
            </TabsContent>

            <TabsContent value="cartao" className="space-y-4">
              <div>
                <Label htmlFor="installments">Numero de Parcelas</Label>
                <Select value={installments.toString()} onValueChange={(v) => setInstallments(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}x {n === 1 ? "(A vista)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-gray-100 p-4 rounded text-center">
                <p className="text-sm font-semibold">Total: R$ {totalAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {installments}x de R$ {(totalAmount / installments).toFixed(2)}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="dinheiro" className="space-y-4">
              <div>
                <Label htmlFor="amountReceived">Valor Recebido (R$)</Label>
                <Input
                  id="amountReceived"
                  type="number"
                  step="0.01"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm font-semibold">Total: R$ {totalAmount.toFixed(2)}</p>
                <p className="text-sm font-semibold mt-2">
                  Troco: R$ {Math.max(0, change).toFixed(2)}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
