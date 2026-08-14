import { Wrench } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HornCalculatorTab } from '@/pages/utilidades/HornCalculatorTab';
import { RefinacaoTab } from '@/pages/utilidades/RefinacaoTab';

export function UtilidadesPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-wide">Utilidades</h1>
        </div>

        <Tabs defaultValue="horn-calculator">
          <TabsList>
            <TabsTrigger value="horn-calculator">Calculadora de Horn</TabsTrigger>
            <TabsTrigger value="refinacao">Refinação</TabsTrigger>
          </TabsList>

          <TabsContent value="horn-calculator">
            <HornCalculatorTab />
          </TabsContent>

          <TabsContent value="refinacao">
            <RefinacaoTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
