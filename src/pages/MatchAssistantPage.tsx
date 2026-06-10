import { useState, useEffect, type FC } from "react";
import {
  HiOutlineBolt,
  HiOutlineUser,
  HiOutlineSparkles,
  HiOutlineChevronDown,
  HiOutlineArrowPath,
  HiOutlineCpuChip,
  HiOutlineTv,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlinePlus,
} from "react-icons/hi2";
import { useGameStore } from "../store/gameStore";
import {
  getPokemonShowdownData,
  searchPokemonShowdown,
  getShowdownSpriteUrl,
  handlePokemonSpriteError,
  type ShowdownPokemon,
} from "../utils/pkmnDataHelper";
import {
  VGC_FORMATS,
  fetchSmogonUsageStats,
  fetchSmogonSets,
  type SmogonUsageStats,
  type SmogonSpeciesSets,
} from "../utils/smogonStats";
import TypeIcon from "../components/atoms/TypeIcon";
import SpeedQueue, {
  type ActivePokemonSpeedState,
} from "../components/molecules/SpeedQueue";
import SmogonThreatPanel from "../components/molecules/SmogonThreatPanel";
import MatchupGrid from "../components/molecules/MatchupGrid";
import Loading from "../components/atoms/Loading";
import { calculateFullSpread } from "../utils/statsCalc";

interface LineupMember {
  id: string; // "p1"..."p6", "o1"..."o6"
  name: string;
  types: string[];
  baseSpeed: number;
  spriteUrl: string;
  isPlayer: boolean;

  // VGC team preview selection
  isBrought: boolean;
  isActive: boolean;

  // Modifiers for speed
  benchmark: "min" | "min_neutral" | "max_neutral" | "max_plus";
  tailwind: boolean;
  scarf: boolean;
  paralysis: boolean;
  stage: number;
}

const MatchAssistantPage: FC = () => {
  const teams = useGameStore((s) => s.teams);
  const builds = useGameStore((s) => s.builds);

  // Format selection
  const [activeFormat, setActiveFormat] = useState<string>(VGC_FORMATS[0].id);
  const [statsData, setStatsData] = useState<Record<string, SmogonUsageStats>>(
    {},
  );
  const [setsData, setSetsData] = useState<Record<string, SmogonSpeciesSets>>(
    {},
  );
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  // Lineup states
  const [playerLineup, setPlayerLineup] = useState<LineupMember[]>([]);
  const [opponentLineup, setOpponentLineup] = useState<LineupMember[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  // Opponent input search
  const [opponentSearch, setOpponentSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ShowdownPokemon[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Focus panel states
  const [activeTab, setActiveTab] = useState<"speed" | "meta" | "matrix">(
    "speed",
  );
  const [selectedOpponentMeta, setSelectedOpponentMeta] = useState<
    string | null
  >(null);

  // Battle Recorder states
  const [customLeads, setCustomLeads] = useState<string[]>([]);
  const [customOpponents, setCustomOpponents] = useState<string[]>([]);
  const [turnsLog, setTurnsLog] = useState<BattleTurn[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const addBattleRecord = useGameStore((s) => s.addBattleRecord);

  // Synchronize player party with brought player Pokémon
  useEffect(() => {
    const broughtP = playerLineup.filter((p) => p.isBrought).map((p) => p.name);
    if (customLeads.length === 0 && broughtP.length > 0) {
      const pad = [...broughtP];
      while (pad.length < 4) pad.push("");
      setCustomLeads(pad.slice(0, 4));
    }
  }, [playerLineup, customLeads]);

  // Synchronize opponent party with brought opponent Pokémon
  useEffect(() => {
    const broughtO = opponentLineup.filter((o) => o.isBrought).map((o) => o.name);
    if (customOpponents.length === 0 && broughtO.length > 0) {
      const pad = [...broughtO];
      while (pad.length < 4) pad.push("");
      setCustomOpponents(pad.slice(0, 4));
    }
  }, [opponentLineup, customOpponents]);

  const handleCustomLeadChange = (index: number, name: string) => {
    const nextLeads = [...customLeads];
    while (nextLeads.length < 4) nextLeads.push("");
    nextLeads[index] = name;
    setCustomLeads(nextLeads);
  };

  const handleCustomOpponentChange = (index: number, name: string) => {
    const nextOpps = [...customOpponents];
    while (nextOpps.length < 4) nextOpps.push("");
    nextOpps[index] = name;
    setCustomOpponents(nextOpps);
  };

  const handleAddTurn = () => {
    const activePlayer = playerLineup.filter((p) => p.isActive);
    const activeOpponent = opponentLineup.filter((o) => o.isActive);

    const actions: TurnAction[] = [];
    activePlayer.forEach((p) => {
      actions.push({
        pokemon: p.name,
        isPlayer: true,
        actionType: "move",
        detail: "",
      });
    });
    activeOpponent.forEach((o) => {
      actions.push({
        pokemon: o.name,
        isPlayer: false,
        actionType: "move",
        detail: "",
      });
    });

    setTurnsLog([...turnsLog, { actions }]);
  };

  const handleActionPokemonChange = (
    turnIdx: number,
    actionIdx: number,
    selectedValue: string
  ) => {
    const nextTurns = [...turnsLog];
    const action = nextTurns[turnIdx].actions[actionIdx];
    if (!selectedValue) {
      action.pokemon = "";
      action.isPlayer = true;
      action.detail = "";
    } else {
      const [type, pokemonName] = selectedValue.split(":");
      action.pokemon = pokemonName || "";
      action.isPlayer = type === "player";
      action.detail = "";
    }
    setTurnsLog(nextTurns);
  };

  const handleMoveAction = (
    turnIdx: number,
    actionIdx: number,
    direction: "up" | "down"
  ) => {
    const nextTurns = [...turnsLog];
    const actions = [...nextTurns[turnIdx].actions];
    const targetIdx = direction === "up" ? actionIdx - 1 : actionIdx + 1;
    if (targetIdx < 0 || targetIdx >= actions.length) return;

    const temp = actions[actionIdx];
    actions[actionIdx] = actions[targetIdx];
    actions[targetIdx] = temp;

    nextTurns[turnIdx].actions = actions;
    setTurnsLog(nextTurns);
  };

  const handleUpdateTurnAction = (
    turnIdx: number,
    actionIdx: number,
    updates: Partial<TurnAction>
  ) => {
    const nextTurns = [...turnsLog];
    nextTurns[turnIdx].actions[actionIdx] = {
      ...nextTurns[turnIdx].actions[actionIdx],
      ...updates,
    };
    setTurnsLog(nextTurns);
  };

  const handleAddTurnAction = (turnIdx: number) => {
    const nextTurns = [...turnsLog];
    const playerFirst = customLeads.filter(Boolean)[0] || "";
    nextTurns[turnIdx].actions.push({
      pokemon: playerFirst,
      isPlayer: true,
      actionType: "move",
      detail: "",
    });
    setTurnsLog(nextTurns);
  };

  const getPlayerMoves = (pokemonName: string): string[] => {
    const build = builds.find(
      (b) =>
        b.species &&
        (b.species.form || b.species.name || b.name).toLowerCase() ===
          pokemonName.toLowerCase()
    );
    return build ? (build.moves.filter(Boolean) as string[]) : [];
  };

  const handleSaveBattleRecord = () => {
    if (!selectedTeamId) return;
    if (opponentLineup.length === 0) return;

    addBattleRecord({
      teamId: selectedTeamId,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      opponentPokemon: customOpponents.filter(Boolean),
      lead: customLeads.filter(Boolean),
      turns: turnsLog,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Reset states
    setOpponentLineup([]);
    setTurnsLog([]);
    setCustomLeads([]);
    setCustomOpponents([]);
    setSelectedOpponentMeta(null);
  };

  const renderTurnSlotEditor = (
    tIdx: number,
    actionIdx: number,
    action: TurnAction
  ) => {
    const isMove = action.actionType === "move";
    const activePlayerParty = customLeads.filter(Boolean);
    const activeOpponentParty = customOpponents.filter(Boolean);

    const moves = getPlayerMoves(action.pokemon);
    const isCustom = action.detail !== "" && !moves.includes(action.detail) && action.detail !== "__custom__";
    const selectValue = isCustom ? "__custom__" : action.detail;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-[#161C29]/40 p-2.5 rounded-lg border border-white/5">
        {/* Sort Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            disabled={actionIdx === 0}
            onClick={() => handleMoveAction(tIdx, actionIdx, "up")}
            className="p-1 rounded text-white/20 hover:text-white/80 disabled:opacity-20 hover:bg-white/5 transition-all cursor-pointer text-xs"
            title="Move Up"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={actionIdx === (turnsLog[tIdx].actions.length - 1)}
            onClick={() => handleMoveAction(tIdx, actionIdx, "down")}
            className="p-1 rounded text-white/20 hover:text-white/80 disabled:opacity-20 hover:bg-white/5 transition-all cursor-pointer text-xs"
            title="Move Down"
          >
            ▼
          </button>
        </div>

        {/* Combined Pokemon Selector */}
        <div className="flex items-center gap-1.5 min-w-[150px] max-w-[200px] w-full">
          <div className="relative w-full">
            <select
              value={action.pokemon ? `${action.isPlayer ? "player" : "opponent"}:${action.pokemon}` : ""}
              onChange={(e) => handleActionPokemonChange(tIdx, actionIdx, e.target.value)}
              className="w-full rounded-md bg-[#0F1115] border border-white/10 px-2 py-1 text-[10px] font-bold text-white outline-none cursor-pointer focus:ring-1 focus:ring-sky-500 appearance-none"
            >
              <option value="">Select Pokémon...</option>
              <optgroup label="Your Party">
                {activePlayerParty.map((name) => (
                  <option key={`player:${name}`} value={`player:${name}`}>
                    {name} [User]
                  </option>
                ))}
              </optgroup>
              <optgroup label="Opponent Party">
                {activeOpponentParty.map((name) => (
                  <option key={`opponent:${name}`} value={`opponent:${name}`}>
                    {name} [Opp]
                  </option>
                ))}
              </optgroup>
            </select>
            <HiOutlineChevronDown
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              size={9}
            />
          </div>
        </div>

        {/* Action Type */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() =>
              handleUpdateTurnAction(tIdx, actionIdx, {
                actionType: "move",
                detail: "",
              })
            }
            className={[
              "px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer border",
              isMove
                ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                : "border-white/5 text-white/30 hover:bg-white/5",
            ].join(" ")}
          >
            Move
          </button>
          <button
            type="button"
            onClick={() =>
              handleUpdateTurnAction(tIdx, actionIdx, {
                actionType: "switch",
                detail: "",
              })
            }
            className={[
              "px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer border",
              !isMove
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "border-white/5 text-white/30 hover:bg-white/5",
            ].join(" ")}
          >
            Switch
          </button>
        </div>

        {/* Detail Input */}
        <div className="flex-grow min-w-[100px] w-full">
          {isMove ? (
            action.isPlayer ? (
              <div className="flex flex-col sm:flex-row gap-1.5 w-full">
                <div className="relative flex-1">
                  <select
                    value={selectValue}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        handleUpdateTurnAction(tIdx, actionIdx, { detail: "" });
                      } else {
                        handleUpdateTurnAction(tIdx, actionIdx, { detail: e.target.value });
                      }
                    }}
                    className="w-full rounded-md bg-[#0F1115] border border-white/10 px-2 py-1 text-[10px] text-white outline-none cursor-pointer focus:ring-1 focus:ring-sky-500 appearance-none"
                  >
                    <option value="">Select Move...</option>
                    {moves.map((move) => (
                      <option key={move} value={move}>
                        {move}
                      </option>
                    ))}
                    <option value="__custom__">Custom Move...</option>
                  </select>
                  <HiOutlineChevronDown
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    size={9}
                  />
                </div>
                {(selectValue === "__custom__" || isCustom) && (
                  <input
                    type="text"
                    placeholder="Custom move..."
                    value={isCustom ? action.detail : ""}
                    onChange={(e) =>
                      handleUpdateTurnAction(tIdx, actionIdx, { detail: e.target.value })
                    }
                    className="w-full sm:w-24 rounded-md bg-[#0F1115] border border-white/10 px-2 py-1 text-[10px] text-white outline-none focus:border-sky-500"
                  />
                )}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Enter move..."
                value={action.detail}
                onChange={(e) =>
                  handleUpdateTurnAction(tIdx, actionIdx, { detail: e.target.value })
                }
                className="w-full rounded-md bg-[#0F1115] border border-white/10 px-2 py-1 text-[10px] text-white placeholder:text-white/25 outline-none focus:border-sky-500"
              />
            )
          ) : (
            <div className="relative w-full">
              <select
                value={action.detail}
                onChange={(e) =>
                  handleUpdateTurnAction(tIdx, actionIdx, { detail: e.target.value })
                }
                className="w-full rounded-md bg-[#0F1115] border border-white/10 px-2 py-1 text-[10px] text-white outline-none cursor-pointer focus:ring-1 focus:ring-sky-500 appearance-none"
              >
                <option value="">Switch in...</option>
                {action.isPlayer
                  ? playerLineup
                      .filter((p) => p.name !== action.pokemon)
                      .map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))
                  : opponentLineup
                      .filter((o) => o.name !== action.pokemon)
                      .map((o) => (
                        <option key={o.name} value={o.name}>
                          {o.name}
                        </option>
                      ))}
              </select>
              <HiOutlineChevronDown
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                size={9}
              />
            </div>
          )}
        </div>

        {/* Delete action button */}
        <button
          type="button"
          onClick={() => {
            const nextTurns = [...turnsLog];
            nextTurns[tIdx].actions = nextTurns[tIdx].actions.filter((_, idx) => idx !== actionIdx);
            setTurnsLog(nextTurns);
          }}
          className="text-white/25 hover:text-[#b22200] text-lg leading-none shrink-0 px-1 hover:bg-[#b22200]/10 rounded transition-colors"
          title="Delete action"
        >
          ×
        </button>
      </div>
    );
  };


  // 1. Fetch Smogon usage & sets when active format changes
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoadingMetadata(true);
      const [stats, sets] = await Promise.all([
        fetchSmogonUsageStats(activeFormat),
        fetchSmogonSets(activeFormat),
      ]);
      if (active) {
        setStatsData(stats);
        setSetsData(sets);
        setLoadingMetadata(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [activeFormat]);

  // Load from an existing team in the store
  const handleLoadTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    setCustomLeads([]);
    setTurnsLog([]);
    const selectedTeam = teams.find((t) => t.id === teamId);
    if (!selectedTeam) return;

    const playerMembers: LineupMember[] = selectedTeam.pokemon
      .map((bId, idx) => {
        const build = builds.find((b) => b.id === bId);
        if (!build || !build.species) return null;

        // Resolve Showdown data if possible for standard stats
        const sdData = getPokemonShowdownData(
          build.species.form || build.species.name,
          build.isShiny,
        );

        // Calculate tailored speed under level 50 using actual SPs and nature
        const tailoredStats = calculateFullSpread(
          build.species.baseStats,
          build.sps,
          build.nature,
        );

        return {
          id: `p-${idx}-${build.id}`,
          name: sdData?.name || build.species.form || build.species.name,
          types: sdData?.types || build.species.types,
          baseSpeed: tailoredStats.spe,
          spriteUrl:
            sdData?.spriteUrl ||
            build.species.sprite ||
            getShowdownSpriteUrl((build.species.form || build.species.name).toLowerCase()),
          isPlayer: true,
          isBrought: true,
          isActive: idx < 2, // Default first two active
          benchmark: "max_plus" as const,
          tailwind: false,
          scarf: build.item?.toLowerCase().includes("scarf") || false,
          paralysis: false,
          stage: 0,
        };
      })
      .filter(Boolean) as LineupMember[];

    setPlayerLineup(playerMembers);
  };

  // Auto-load the first team on initial mount/load if available
  useEffect(() => {
    if (teams.length > 0 && playerLineup.length === 0 && !selectedTeamId) {
      const firstTeam = teams[0];
      handleLoadTeam(firstTeam.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams.length]);

  // Add Opponent species
  const handleAddOpponentSpecies = (species: ShowdownPokemon) => {
    if (opponentLineup.length >= 6) return;

    // Check if we have a custom build in our team hub for this species to reuse the working custom sprite!
    const matchingBuild = builds.find(
      (b) =>
        b.species &&
        (b.species.form || b.species.name).toLowerCase() === species.name.toLowerCase(),
    );

    const newMember: LineupMember = {
      id: `opp-${Date.now()}-${species.id}`,
      name: species.name,
      types: species.types,
      baseSpeed: species.baseStats.spe,
      spriteUrl: matchingBuild?.species?.sprite || species.spriteUrl,
      isPlayer: false,
      isBrought: true,
      isActive: opponentLineup.filter((p) => p.isActive).length < 2,
      benchmark: "max_plus",
      tailwind: false,
      scarf: false,
      paralysis: false,
      stage: 0,
    };
    setOpponentLineup([...opponentLineup, newMember]);
    setSelectedOpponentMeta(species.name); // Automatically select newly added for meta tab
    setOpponentSearch("");
    setShowDropdown(false);
  };

  // Handle autocomplete input changes
  useEffect(() => {
    if (!opponentSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const results = searchPokemonShowdown(opponentSearch);
    
    // Enhance autocomplete results with custom sprites from player's builds if available
    const enhancedResults = results.map((res) => {
      const matchingBuild = builds.find(
        (b) =>
          b.species &&
          (b.species.form || b.species.name).toLowerCase() === res.name.toLowerCase(),
      );
      if (matchingBuild?.species?.sprite) {
        return {
          ...res,
          spriteUrl: matchingBuild.species.sprite,
        };
      }
      return res;
    });

    setSearchResults(enhancedResults);
  }, [opponentSearch, builds]);

  // Modifiers sync functions for Speed Queue
  const handleSpeedStateUpdate = (
    id: string,
    updates: Partial<ActivePokemonSpeedState>,
  ) => {
    setPlayerLineup((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
    setOpponentLineup((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  // Toggle brought/active markers
  const handleToggleBrought = (id: string, isPlayer: boolean) => {
    const list = isPlayer ? playerLineup : opponentLineup;
    const setList = isPlayer ? setPlayerLineup : setOpponentLineup;

    setList(
      list.map((p) => {
        if (p.id !== id) return p;
        const newBrought = !p.isBrought;
        return {
          ...p,
          isBrought: newBrought,
          isActive: newBrought ? p.isActive : false, // Unbring removes active
        };
      }),
    );
  };

  const handleToggleActiveField = (id: string, isPlayer: boolean) => {
    const list = isPlayer ? playerLineup : opponentLineup;
    const setList = isPlayer ? setPlayerLineup : setOpponentLineup;

    // Check currently active count
    const activeCount = list.filter((p) => p.isActive && p.id !== id).length;

    setList(
      list.map((p) => {
        if (p.id !== id) return p;
        if (!p.isBrought) return p; // Cannot active unbrought Pokémon

        // Cap at 2 active field combatants per team
        if (!p.isActive && activeCount >= 2) return p;

        return { ...p, isActive: !p.isActive };
      }),
    );
  };

  // Quick reset whole match setup
  const handleResetMatch = () => {
    setPlayerLineup([]);
    setOpponentLineup([]);
    setOpponentSearch("");
    setSelectedOpponentMeta(null);
    setSelectedTeamId("");
    setCustomLeads([]);
    setTurnsLog([]);
  };

  // Aggregated speed array for the SpeedQueue component
  const speedQueueProps: ActivePokemonSpeedState[] = [
    ...playerLineup.filter((p) => p.isBrought),
    ...opponentLineup.filter((p) => p.isBrought),
  ].map((p) => ({
    id: p.id,
    name: p.name,
    spriteUrl: p.spriteUrl,
    types: p.types,
    baseSpeed: p.baseSpeed,
    isPlayer: p.isPlayer,
    benchmark: p.benchmark,
    tailwind: p.tailwind,
    scarf: p.scarf,
    paralysis: p.paralysis,
    stage: p.stage,
  }));

  const activeFormatLabel =
    VGC_FORMATS.find((f) => f.id === activeFormat)?.label || activeFormat;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-10 flex flex-col gap-6 md:gap-10">
      {/* Dynamic Header */}
      <header className="flex items-start justify-between gap-6 flex-wrap pb-4 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <HiOutlineTv size={26} className="text-[#b22200]" />
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Live Match Assistant
            </h1>
          </div>
          <p className="text-white/30 text-xs font-semibold">
            Second-screen VGC companion for active battle speed calculations and
            Smogon sets.
          </p>
        </div>

        {/* Format Selector & Reset controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
              Metagame Ruleset
            </span>
            <div className="relative">
              <select
                value={activeFormat}
                onChange={(e) => setActiveFormat(e.target.value)}
                className="rounded-xl bg-[#161C29] pl-4 pr-10 py-2.5 text-xs font-bold text-white outline-none border border-white/5 focus:ring-1 focus:ring-[#b22200]/50 appearance-none cursor-pointer transition-all"
              >
                {VGC_FORMATS.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#0F1115]">
                    {f.label}
                  </option>
                ))}
              </select>
              <HiOutlineChevronDown
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                size={12}
              />
            </div>
          </div>

          <button
            onClick={handleResetMatch}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-white/40 hover:text-white/80 hover:bg-white/10 text-xs font-bold cursor-pointer transition-all mt-auto"
            title="Reset Match Setup"
          >
            <HiOutlineArrowPath size={14} />
            Reset Match
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Match Setup Panels (4 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Your Team Setup */}
          <div
            className="bg-[#161C29] p-5 rounded-2xl border border-white/5"
            style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.08)" }}
          >
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <HiOutlineUser size={16} className="text-sky-400" />
                <h3 className="text-white font-bold text-sm">Your Lineup</h3>
              </div>

              {/* Load Team Dropdown */}
              {teams.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => handleLoadTeam(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-bold text-sky-400 cursor-pointer outline-none hover:text-sky-300 pr-4 appearance-none"
                  >
                    <option value="" disabled className="bg-[#0F1115]">
                      Load team...
                    </option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0F1115]">
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <HiOutlineChevronDown
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none"
                    size={9}
                  />
                </div>
              )}
            </div>

            {playerLineup.length === 0 ? (
              <div className="py-8 text-center text-white/20 text-xs border border-dashed border-white/5 rounded-xl">
                Load a VGC team from the dropdown to initialize your lineup.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {playerLineup.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-white/2 border border-white/5 p-2 rounded-xl text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.spriteUrl}
                        alt={p.name}
                        className="w-10 h-10 object-contain pointer-events-none"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold capitalize truncate">
                          {p.name}
                        </span>
                        <span className="text-white/30 text-[10px]">
                          Speed: {p.baseSpeed}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Brought Toggle */}
                      <button
                        onClick={() => handleToggleBrought(p.id, true)}
                        className={[
                          "px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all border",
                          p.isBrought
                            ? "bg-sky-500/20 border-sky-500/40 text-sky-400"
                            : "border-white/5 text-white/20 hover:bg-white/5",
                        ].join(" ")}
                      >
                        Brought
                      </button>

                      {/* Active On Field Toggle */}
                      <button
                        onClick={() => handleToggleActiveField(p.id, true)}
                        disabled={!p.isBrought}
                        className={[
                          "px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all border",
                          p.isActive
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "border-white/5 text-white/10 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5",
                        ].join(" ")}
                      >
                        Active
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opponent Team Setup */}
          <div
            className="bg-[#161C29] p-5 rounded-2xl border border-white/5 animate-fade-in"
            style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.08)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <HiOutlineBolt size={16} className="text-[#b22200]" />
                <h3 className="text-white font-bold text-sm">
                  Opponent Lineup
                </h3>
              </div>
              <span className="text-[10px] text-white/30 font-black tabular-nums uppercase">
                {opponentLineup.length} / 6
              </span>
            </div>

            {/* Opponent Autocomplete Input */}
            {opponentLineup.length < 6 ? (
              <div className="relative mb-4 z-30">
                <input
                  type="text"
                  value={opponentSearch}
                  onChange={(e) => setOpponentSearch(e.target.value)}
                  placeholder="Search and add opponent species..."
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="w-full rounded-xl bg-[#161C29] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none border-none focus:ring-1 focus:ring-[#b22200]/50 transition-all border border-white/5"
                />

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#161C29] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto z-50">
                    {searchResults.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => handleAddOpponentSpecies(res)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer text-xs border-b border-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={res.spriteUrl}
                            alt={res.name}
                            className="w-8 h-8 object-contain pointer-events-none"
                            onError={(e) => handlePokemonSpriteError(e, res.name)}
                          />
                          <span className="text-white font-bold capitalize truncate">
                            {res.name}
                          </span>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {res.types.map((type) => (
                            <TypeIcon key={type} type={type} size={11} />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {opponentLineup.length === 0 ? (
              <div className="py-12 text-center text-white/20 text-xs border border-dashed border-white/5 rounded-xl">
                Type above to add the opponent's 6 Pokémon species.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {opponentLineup.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-white/2 border border-white/5 p-2 rounded-xl text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.spriteUrl}
                        alt={p.name}
                        className="w-10 h-10 object-contain pointer-events-none"
                        onError={(e) => handlePokemonSpriteError(e, p.name)}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold capitalize truncate">
                          {p.name}
                        </span>
                        <span className="text-white/30 text-[10px]">
                          Speed: {p.baseSpeed}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Brought Toggle */}
                      <button
                        onClick={() => handleToggleBrought(p.id, false)}
                        className={[
                          "px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all border",
                          p.isBrought
                            ? "bg-[#b22200]/20 border-[#b22200]/40 text-[#b22200]"
                            : "border-white/5 text-white/20 hover:bg-white/5",
                        ].join(" ")}
                      >
                        Brought
                      </button>

                      {/* Active On Field Toggle */}
                      <button
                        onClick={() => handleToggleActiveField(p.id, false)}
                        disabled={!p.isBrought}
                        className={[
                          "px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all border",
                          p.isActive
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "border-white/5 text-white/10 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5",
                        ].join(" ")}
                      >
                        Active
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          setOpponentLineup(
                            opponentLineup.filter((m) => m.id !== p.id),
                          )
                        }
                        className="text-white/20 hover:text-[#b22200] p-1 rounded transition-colors cursor-pointer"
                      >
                        <HiOutlineTrash size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Battle Recorder Widget */}
          {opponentLineup.length > 0 && selectedTeamId && (
            <div
              className="bg-[#161C29] p-5 rounded-2xl border border-white/5 animate-fade-in flex flex-col gap-4"
              style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.08)" }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <HiOutlineTv size={16} className="text-[#b22200]" />
                  <h3 className="text-white font-bold text-sm">
                    Battle Recorder
                  </h3>
                </div>
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg animate-fade-in">
                    <HiOutlineCheck size={10} /> Saved!
                  </span>
                )}
              </div>

              {/* Customizable Parties */}
              <div className="flex flex-col gap-4 bg-white/2 border border-white/5 p-4 rounded-xl">
                {/* Your Party */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Your Party (Brought Pokémon - Max 4)
                  </span>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx} className="relative">
                        <select
                          value={customLeads[idx] || ""}
                          onChange={(e) => handleCustomLeadChange(idx, e.target.value)}
                          className="w-full rounded-xl bg-[#0F1115] border border-white/10 px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer focus:ring-1 focus:ring-[#b22200]/50 appearance-none"
                        >
                          <option value="">Select Pokémon...</option>
                          {playerLineup.map((p) => (
                            <option key={p.name} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <HiOutlineChevronDown
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                          size={12}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opponent Party */}
                <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Opponent Party (Brought Pokémon - Max 4)
                  </span>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx} className="relative">
                        <select
                          value={customOpponents[idx] || ""}
                          onChange={(e) => handleCustomOpponentChange(idx, e.target.value)}
                          className="w-full rounded-xl bg-[#0F1115] border border-white/10 px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer focus:ring-1 focus:ring-[#b22200]/50 appearance-none"
                        >
                          <option value="">Select Pokémon...</option>
                          {opponentLineup.map((o) => (
                            <option key={o.name} value={o.name}>
                              {o.name}
                            </option>
                          ))}
                        </select>
                        <HiOutlineChevronDown
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                          size={12}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Turn Log Editor */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Match turns log (optional)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddTurn}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#b22200]/30 hover:border-[#b22200]/60 bg-[#b22200]/10 text-[#b22200] hover:bg-[#b22200]/25 text-[10px] font-bold cursor-pointer transition-all"
                  >
                    <HiOutlinePlus size={12} />
                    Add Turn
                  </button>
                </div>

                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {turnsLog.length === 0 ? (
                    <div className="py-6 text-center text-white/15 text-[10px] font-medium border border-dashed border-white/5 rounded-xl">
                      No turns logged yet. Click "Add Turn" to track battle actions.
                    </div>
                  ) : (
                    turnsLog.map((turn, tIdx) => (
                      <div
                        key={tIdx}
                        className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col gap-2.5 relative animate-fade-in"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-[10px] font-bold text-white/40 tracking-wider">
                            TURN {tIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setTurnsLog(turnsLog.filter((_, idx) => idx !== tIdx))
                            }
                            className="text-white/20 hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
                            title="Delete Turn"
                          >
                            <HiOutlineTrash size={12} />
                          </button>
                        </div>

                        <div className="flex flex-col gap-2 animate-fade-in">
                          {turn.actions.map((action, actionIdx) => (
                            <div key={actionIdx}>
                              {renderTurnSlotEditor(tIdx, actionIdx, action)}
                            </div>
                          ))}

                          {turn.actions.length < 4 && (
                            <button
                              type="button"
                              onClick={() => handleAddTurnAction(tIdx)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-white/10 hover:border-white/25 bg-white/2 text-white/40 hover:text-white/70 text-[9px] font-bold cursor-pointer transition-all w-fit mt-1"
                            >
                              <HiOutlinePlus size={10} className="mr-0.5" />
                              Add Action
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleSaveBattleRecord}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#b22200] text-white font-bold text-xs hover:bg-[#c32b0a] active:bg-[#a11c00] transition-colors cursor-pointer shadow-lg shadow-[#b22200]/10"
              >
                Save Battle Record
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Battle Analytics & Queue Panels (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
          {/* Main Analytics Hub */}
          <div
            className="bg-[#161C29] p-5 rounded-2xl border border-white/5"
            style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.08)" }}
          >
            {/* Tabs */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mb-5">
              <button
                onClick={() => setActiveTab("speed")}
                className={[
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap px-4",
                  activeTab === "speed"
                    ? "bg-[#b22200] text-white shadow-sm"
                    : "text-white/40 hover:text-white/70",
                ].join(" ")}
              >
                <HiOutlineBolt size={14} />
                <span className="sm:inline hidden">Speed Tiers</span>
                <span className="sm:hidden inline">Speed</span>
              </button>

              <button
                onClick={() => setActiveTab("meta")}
                className={[
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap px-4",
                  activeTab === "meta"
                    ? "bg-[#b22200] text-white shadow-sm"
                    : "text-white/40 hover:text-white/70",
                ].join(" ")}
              >
                <HiOutlineCpuChip size={14} />
                <span className="sm:inline hidden">Smogon Meta Profiles</span>
                <span className="sm:hidden inline">Meta</span>
              </button>

              <button
                onClick={() => setActiveTab("matrix")}
                className={[
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap px-4",
                  activeTab === "matrix"
                    ? "bg-[#b22200] text-white shadow-sm"
                    : "text-white/40 hover:text-white/70",
                ].join(" ")}
              >
                <HiOutlineSparkles size={14} />
                <span className="sm:inline hidden">2v2 Type Matrix</span>
                <span className="sm:hidden inline">Matrix</span>
              </button>
            </div>

            {/* In-tab Loading state */}
            {loadingMetadata ? (
              <div className="flex items-center justify-center py-20 flex-col gap-3">
                <Loading size="md" />
                <span className="text-white/30 text-xs font-semibold">
                  Updating metagame profiles for {activeFormatLabel}...
                </span>
              </div>
            ) : (
              <>
                {/* 1. Speed Tiers Tab */}
                {activeTab === "speed" && (
                  <SpeedQueue
                    pokemonList={speedQueueProps}
                    onUpdate={handleSpeedStateUpdate}
                  />
                )}

                {/* 2. Smogon Meta Profiles Tab */}
                {activeTab === "meta" && (
                  <div className="flex flex-col gap-6">
                    {/* Horizontal Selection Ribbon */}
                    <div className="flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                        SELECT OPPONENT FOR COMPETITIVE BIO:
                      </span>
                      {opponentLineup.length === 0 ? (
                        <p className="text-white/20 text-xs">
                          No opponents added yet.
                        </p>
                      ) : (
                        <div className="flex gap-2 overflow-x-auto pb-1.5 shrink-0">
                          {opponentLineup.map((opp) => {
                            const isSelected =
                              selectedOpponentMeta === opp.name;
                            return (
                              <button
                                key={opp.id}
                                onClick={() =>
                                  setSelectedOpponentMeta(opp.name)
                                }
                                className={[
                                  "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                                  isSelected
                                    ? "bg-[#b22200]/15 border-[#b22200] text-[#b22200]"
                                    : "bg-white/5 border-white/5 text-white/40 hover:text-white/80 hover:bg-white/10",
                                ].join(" ")}
                              >
                                <img
                                  src={opp.spriteUrl}
                                  alt={opp.name}
                                  className="w-6 h-6 object-contain pointer-events-none"
                                  onError={(e) => handlePokemonSpriteError(e, opp.name)}
                                />
                                <span className="capitalize">{opp.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Threat Panel Display */}
                    {selectedOpponentMeta ? (
                      <SmogonThreatPanel
                        speciesName={selectedOpponentMeta}
                        spriteUrl={
                          opponentLineup.find(
                            (o) => o.name === selectedOpponentMeta,
                          )?.spriteUrl ||
                          getShowdownSpriteUrl(
                            selectedOpponentMeta.toLowerCase(),
                          )
                        }
                        usageData={statsData}
                        setData={setsData}
                        formatLabel={activeFormatLabel}
                      />
                    ) : (
                      <div className="py-12 text-center text-white/20 text-sm">
                        Select an opponent species above to view EV spreads,
                        movesets, and items.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. 2v2 Type Matrix Tab */}
                {activeTab === "matrix" && (
                  <MatchupGrid
                    playerActive={playerLineup
                      .filter((p) => p.isActive)
                      .map((p) => ({
                        id: p.id,
                        name: p.name,
                        types: p.types,
                        spriteUrl: p.spriteUrl,
                      }))}
                    opponentActive={opponentLineup
                      .filter((o) => o.isActive)
                      .map((o) => ({
                        id: o.id,
                        name: o.name,
                        types: o.types,
                        spriteUrl: o.spriteUrl,
                      }))}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchAssistantPage;
