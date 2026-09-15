import TableList from '@/components/custom-ui/leads/subscriptions/TableList';
import AppLayout from '@/layouts/app-layout';
import { Subscription } from '@/types/leads/newsletter';
import {Paginate} from "@/interfaces/paginate"   // O de donde importes tu tipo Paginated
import { Head, usePage } from '@inertiajs/react';

export default function Index() {
  const { subscriptions, filters } = usePage<{
    subscriptions: Paginated<Subscription>;
    filters: { search?: string };
  }>().props;

  return (
    <AppLayout>
      <Head title="Lista de Suscripciones" />

      <div className="flex flex-1 flex-col gap-6 rounded-xl">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold lg:text-2xl">
            Lista de Suscripciones
          </h1>
        </div>

        <TableList 
          data={subscriptions} 
          filters={filters} 
        />
      </div>
    </AppLayout>
  );
}