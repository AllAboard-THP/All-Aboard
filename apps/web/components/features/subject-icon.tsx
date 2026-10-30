type Props = {
  icon: string;
  accentColor: string;
  name: string;
};

export function SubjectIcon({ icon, accentColor, name }: Props) {
  const label = icon.trim().length > 0 ? icon.slice(0, 2).toUpperCase() : name.slice(0, 2).toUpperCase();

  return (
    <div
      className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold uppercase tracking-wide"
      style={{
        backgroundColor: `${accentColor}1f`,
        color: accentColor,
      }}
      aria-hidden
    >
      {label}
    </div>
  );
}
