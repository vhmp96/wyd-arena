import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  value: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = 'Selecionar data', className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;
  const validSelected = selected && isValid(selected) ? selected : undefined;

  function handleSelect(day: Date | undefined) {
    if (day) {
      onChange(format(day, 'yyyy-MM-dd'));
    } else {
      onChange('');
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start text-left font-normal', !validSelected && 'text-muted-foreground', className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {validSelected ? format(validSelected, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Calendar
          mode="single"
          selected={validSelected}
          onSelect={handleSelect}
          locale={ptBR}
          initialFocus
        />
        {validSelected && (
          <div className="border-t px-3 pb-3">
            <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground" onClick={() => { onChange(''); setOpen(false); }}>
              Limpar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
