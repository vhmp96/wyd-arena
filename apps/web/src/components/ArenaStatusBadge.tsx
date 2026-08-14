import type { ArenaStatus } from '@wyd/shared';
import { Badge } from '@/components/ui/badge';

const variantMap: Record<ArenaStatus, 'success' | 'destructive' | 'warning'> = {
  VALID: 'success',
  INVALID: 'destructive',
  PENDING: 'warning',
};

const labelMap: Record<ArenaStatus, string> = {
  VALID: 'Válida',
  INVALID: 'Inválida',
  PENDING: 'Pendente',
};

interface Props {
  status: ArenaStatus;
}

export function ArenaStatusBadge({ status }: Props) {
  return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>;
}
