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
  evs: Stats;
  ivs: Stats;
  moves: [string, string, string, string];
} {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const evs: Stats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const ivs: Stats = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  const moves: [string, string, string, string] = ["", "", "", ""];
  const result: Partial<PokemonBuild> & {
    evs: Stats;
    ivs: Stats;
    moves: [string, string, string, string];
  } = { evs, ivs, moves };

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
            if (key) evs[key] = parseInt(m[1], 10);
          }
        });
      continue;
    }

    if (line.startsWith("IVs:")) {
      line
        .slice(4)
        .trim()
        .split("/")
        .forEach((part) => {
          const m = part.trim().match(/^(\d+)\s+(\w+)$/);
          if (m) {
            const key = evKeyMap[m[2]];
            if (key) ivs[key] = parseInt(m[1], 10);
          }
        });
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
