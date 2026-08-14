export function KingdomDot({ kingdom }: { kingdom: string | null | undefined }) {
  const color =
    kingdom === 'blue' ? 'bg-blue-500' :
    kingdom === 'red'  ? 'bg-red-500'  :
    'bg-white border border-white';

  const label =
    kingdom === 'blue' ? 'Reino Azul' :
    kingdom === 'red'  ? 'Reino Vermelho' :
    'Sem reino';

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full shrink-0 ${color}`}
      title={label}
    />
  );
}

export function GuildIcon({ guildMark, size = 4 }: { guildMark: string | null | undefined; size?: number }) {
  if (!guildMark) return null;
  return (
    <img
      src={`https://wydmisc.raidhut.com.br/guild/img_guilds/global/${guildMark}.bmp`}
      alt=""
      className={`h-${size} w-${size} shrink-0 object-contain`}
      style={{ display: 'none' }}
      onLoad={(e) => { e.currentTarget.style.display = 'inline'; }}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
}
