const GENDER_TERMS = new Set(["m", "f", "male", "female"]);

export function extractSpeciesFromLine(line: string): string {
  const atIdx = line.lastIndexOf(" @ ");
  const namePart = atIdx !== -1 ? line.slice(0, atIdx).trim() : line.trim();

  const parenMatches = [...namePart.matchAll(/\(([^)]+)\)/g)];
  const speciesParens = parenMatches.filter(
    (m) => !GENDER_TERMS.has(m[1].trim().toLowerCase()),
  );

  if (speciesParens.length > 0) {
    return speciesParens[speciesParens.length - 1][1].trim().toLowerCase();
  }

  // No species parens — strip any gender parens and use the remaining text
  const beforeParen = namePart.includes("(")
    ? namePart.slice(0, namePart.indexOf("(")).trim()
    : namePart;
  return beforeParen.toLowerCase();
}

const evKeyMap: Record<string, keyof Stats> = {
  HP: "hp",
  Atk: "atk",
  Def: "def",
  SpA: "spa",
  SpD: "spd",
  Spe: "spe",
};

export function parsePokepaste(text: string): Partial<PokemonBuild> & {
  sps: Stats;
  moves: [string, string, string, string];
} {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const sps: Stats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const moves: [string, string, string, string] = ["", "", "", ""];
  const result: Partial<PokemonBuild> & {
    sps: Stats;
    moves: [string, string, string, string];
  } = { sps, moves };

  let moveCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // First line: "Species @ Item" or "Species (nickname) @ Item"
    if (i === 0) {
      if (line.includes(" @ ")) {
        const atIdx = line.lastIndexOf(" @ ");
        result.item = line.slice(atIdx + 3).trim();
      }
      continue;
    }

    if (line.startsWith("Tera Type:")) {
      result.teraType = line.slice(10).trim().toLowerCase();
      continue;
    }

    if (line.startsWith("Shiny:")) {
      result.isShiny = line.slice(6).trim().toLowerCase() === "yes";
      continue;
    }

    if (line.startsWith("Ability:")) {
      result.ability = line.slice(8).trim().toLowerCase().replace(/\s+/g, "-");
      continue;
    }

    if (line.startsWith("EVs:")) {
      line
        .slice(4)
        .trim()
        .split("/")
        .forEach((part) => {
          const m = part.trim().match(/^(\d+)\s+(\w+)$/);
          if (m) {
            const key = evKeyMap[m[2]];
            if (key) {
              const ev = parseInt(m[1], 10);
              // Convert legacy EVs to SPs: 0 EVs = 0 SP, 4 EVs = 1 SP, 12 EVs = 2 SP... 252 EVs = 32 SP
              sps[key] = ev === 0 ? 0 : Math.floor((ev - 4) / 8) + 1;
            }
          }
        });
      continue;
    }

    if (line.startsWith("SPs:")) {
      line
        .slice(4)
        .trim()
        .split("/")
        .forEach((part) => {
          const m = part.trim().match(/^(\d+)\s+(\w+)$/);
          if (m) {
            const key = evKeyMap[m[2]];
            if (key) {
              const sp = parseInt(m[1], 10);
              // Already SPs, keep as is (capped at 32)
              sps[key] = Math.max(0, Math.min(32, sp));
            }
          }
        });
      continue;
    }

    // IVs are ignored in the new SP system (always 31)
    if (line.startsWith("IVs:")) {
      continue;
    }

    if (line.endsWith(" Nature")) {
      result.nature = line.slice(0, -7).trim() as Nature;
      continue;
    }

    if (line.startsWith("- ") && moveCount < 4) {
      moves[moveCount++] = line.slice(2).trim();
      continue;
    }
  }

  return result;
}
