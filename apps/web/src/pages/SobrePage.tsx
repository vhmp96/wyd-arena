import { QRCodeSVG } from 'qrcode.react';
import { MessageCircle, Heart, Swords, Bug } from 'lucide-react';
import { Layout } from '@/components/Layout';

const PIX_CODE = import.meta.env.VITE_PIX_CODE as string | undefined;

export function SobrePage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-wide">Sobre a Iniciativa</h1>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            O WYD Arena Tracker nasceu da vontade de dar mais visibilidade às Arenas do WYD Global.
            O site é feito pela comunidade, para a comunidade — qualquer jogador pode acompanhar o
            ranking, o histórico dos players e os resultados de cada arena sem precisar ficar
            dependendo de prints ou boca-a-boca.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Fale com o desenvolvedor
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Encontrou um bug? Tem uma sugestão de melhoria? Quer ver alguma funcionalidade nova?
            Me manda uma mensagem — estou no jogo e no Discord com o mesmo nick.
          </p>
          <div className="flex items-center gap-3 rounded-md border border-border bg-background px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Nick no jogo · Discord</span>
              <span className="font-mono text-lg font-bold text-primary tracking-widest">deuteront</span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Bug className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/60" />
            <span>Bugs e sugestões ajudam diretamente a melhorar o tracker para todos.</span>
          </div>
        </div>

        {PIX_CODE && (
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Apoie o projeto
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O tracker roda em servidor pago. Se ele te ajuda e você quiser contribuir para
              manter tudo no ar, qualquer valor via PIX é muito bem-vindo — mas não é obrigatório,
              o site sempre será gratuito para todos.
            </p>
            <div className="flex items-start gap-6">
              <div className="rounded-lg overflow-hidden border border-border bg-white p-2 shrink-0">
                <QRCodeSVG
                  value={PIX_CODE}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#0f1623"
                  level="M"
                />
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">Como apoiar via PIX</p>
                <ol className="text-muted-foreground space-y-1 text-xs list-decimal list-inside leading-relaxed">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha pagar com PIX</li>
                  <li>Escaneie o QR code ao lado</li>
                  <li>Confirme o valor que quiser</li>
                </ol>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
