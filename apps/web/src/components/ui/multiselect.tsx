import * as React from 'react';
import { X, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = 'Selecionar jogadores...' }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = options.filter(
    (o) => o.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o),
  );

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function remove(value: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== value));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
          className="flex min-h-10 w-full cursor-pointer flex-wrap items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        >
          {selected.length === 0 && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {selected.map((s) => (
            <span key={s} className="flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
              {s}
              <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={(e) => remove(s, e)} />
            </span>
          ))}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0" sideOffset={4}>
        <div className="border-b p-2">
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jogador..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {selected.length > 0 && (
            <>
              {selected.map((s) => (
                <div
                  key={s}
                  onClick={() => toggle(s)}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-primary bg-primary text-[10px] text-primary-foreground">✓</span>
                  {s}
                </div>
              ))}
              <div className="mx-2 my-1 border-t" />
            </>
          )}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">Nenhum resultado.</p>
          )}
          {filtered.map((o) => (
            <div
              key={o}
              onClick={() => toggle(o)}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
            >
              <span className={cn('flex h-4 w-4 items-center justify-center rounded border border-input')} />
              {o}
            </div>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="border-t p-2">
            <button
              onClick={() => onChange([])}
              className="w-full rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              Limpar seleção
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
