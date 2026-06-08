import { getOrders } from "lib/medusa";
import { OrderCard } from "components/account/order-card";

export const metadata = {
  title: "Pedidos",
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h2 className="text-base/7 font-semibold text-gray-900">Pedidos</h2>
      <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">
        Verifique o status dos pedidos recentes e gerencie as devoluções.
      </p>

      <div className="mt-10 ">
        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">
              Você ainda não fez nenhum pedido.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
