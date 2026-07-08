import * as Flags from "country-flag-icons/react/3x2";

function FlagIcon({ code, size = 14 }: { code: string; size?: number }) {
  const Flag = (Flags as any)[code];

  if (!Flag) return null;

  return (
    <span className="inline-block align-middle" style={{ height: size }}>
      <Flag
        title={code}
        style={{
          height: size,
          width: (size * 3) / 2,
          borderRadius: 2,
          display: "block",
        }}
      />
    </span>
  );
}

export default FlagIcon;
