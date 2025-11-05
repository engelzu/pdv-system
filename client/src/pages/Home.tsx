import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/dashboard/sales");
    }
  }, [isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />}
            <h1 className="text-2xl font-bold text-blue-600">{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Sistema PDV</h2>
          <p className="text-gray-600 mb-8">
            Bem-vindo ao seu sistema de ponto de venda. Faça login para começar a gerenciar suas vendas, clientes e produtos.
          </p>

          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="w-full"
          >
            Fazer Login
          </Button>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Funcionalidades</h3>
            <ul className="space-y-3 text-left text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Cadastro e gerenciamento de clientes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Cadastro e gerenciamento de produtos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Carrinho de compras intuitivo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Múltiplas formas de pagamento (PIX, Cartão, Dinheiro)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Histórico completo de vendas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Exportação de comprovantes em PDF
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 Sistema PDV. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
