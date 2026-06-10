import { useState, type FC, useEffect, useRef } from "react";
import {
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlinePlus,
} from "react-icons/hi2";
import { useGameStore } from "../../store/gameStore";
import {
  getShowdownSpriteUrl,
  handlePokemonSpriteError,
  searchPokemonShowdown,
  type ShowdownPokemon,
} from "../../utils/pkmnDataHelper";

interface BattleRecordCardProps {
  record: BattleRecord;
  onDelete: () => void;
}

const BattleRecordCard: FC<BattleRecordCardProps> = ({ record, onDelete }) => {
  const team = useGameStore((s) => s.teams.find((t) => t.id === record.teamId));
  const builds = useGameStore((s) => s.builds);
  const updateBattleRecord = useGameStore((s) => s.updateBattleRecord);

  // Roster Pokémon names
  const roster = team
    ? team.pokemon
        .map((id) => builds.find((b) => b.id === id))
        .filter(Boolean)
    : [];
  
  const rosterNames = roster.map((p) => p?.species?.form || p?.species?.name || p?.name || "").filter(Boolean);

  const [expanded, setExpanded] = useState(false);
  const [isEditingTurns, setIsEditingTurns] = useState(false);

  // Opponent addition autocomplete states
  const [showAddOpponent, setShowAddOpponent] = useState(false);
  const [opponentSearch, setOpponentSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ShowdownPokemon[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!opponentSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const results = searchPokemonShowdown(opponentSearch);
    setSearchResults(results);
  }, [opponentSearch]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAddOpponent(false);
        setOpponentSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPlayerMoves = (pokemonName: string): string[] => {
    const build = builds.find(
      (b) =>
        b.species &&
        (b.species.form || b.species.name || b.name).toLowerCase() ===
          pokemonName.toLowerCase()
    );
    return build ? (build.moves.filter(Boolean) as string[]) : [];
  };

  const handleLeadChange = (index: number, val: string) => {
    const nextLeads = [...record.lead];
    while (nextLeads.length < 4) nextLeads.push("");
    nextLeads[index] = val;
    updateBattleRecord(record.id, { lead: nextLeads });
  };

  const handleAddOpponent = (speciesName: string) => {
    if (record.opponentPokemon.length >= 4) return;
    updateBattleRecord(record.id, {
      opponentPokemon: [...record.opponentPokemon, speciesName],
    });
    setOpponentSearch("");
    setShowAddOpponent(false);
  };

  const handleRemoveOpponent = (index: number) => {
    const nextOpponents = record.opponentPokemon.filter((_, idx) => idx !== index);
    updateBattleRecord(record.id, { opponentPokemon: nextOpponents });
  };

  // Find build sprite for lead Pokémon
  const getPlayerSprite = (name: string) => {
    const build = roster.find(
      (b) =>
        (b?.species?.form || b?.species?.name || b?.name || "")
          .toLowerCase() === name.toLowerCase()
    );
    return build?.species?.sprite || getShowdownSpriteUrl(name);
  };

  const handleAddTurn = () => {
    const nextTurns = [...(record.turns || [])];
    const actions: TurnAction[] = [];
    
    // Pre-populate with first active player and opponent Pokemon
    const activeP = record.lead.filter(Boolean);
    const activeO = record.opponentPokemon.filter(Boolean);

    if (activeP[0]) {
      actions.push({ pokemon: activeP[0], isPlayer: true, actionType: "move", detail: "" });
    }
    if (activeP[1]) {
      actions.push({ pokemon: activeP[1], isPlayer: true, actionType: "move", detail: "" });
    }
    if (activeO[0]) {
      actions.push({ pokemon: activeO[0], isPlayer: false, actionType: "move", detail: "" });
    }
    if (activeO[1]) {
      actions.push({ pokemon: activeO[1], isPlayer: false, actionType: "move", detail: "" });
    }

    updateBattleRecord(record.id, { turns: [...nextTurns, { actions }] });
    setExpanded(true);
    setIsEditingTurns(true);
  };

  const handleActionPokemonChange = (
    turnIdx: number,
    actionIdx: number,
    selectedValue: string
  ) => {
    const nextTurns = [...(record.turns || [])];
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
    updateBattleRecord(record.id, { turns: nextTurns });
  };

  const handleMoveAction = (
    turnIdx: number,
    actionIdx: number,
    direction: "up" | "down"
  ) => {
    const nextTurns = [...(record.turns || [])];
    const actions = [...nextTurns[turnIdx].actions];
    const targetIdx = direction === "up" ? actionIdx - 1 : actionIdx + 1;
    if (targetIdx < 0 || targetIdx >= actions.length) return;

    const temp = actions[actionIdx];
    actions[actionIdx] = actions[targetIdx];
    actions[targetIdx] = temp;

    nextTurns[turnIdx].actions = actions;
    updateBattleRecord(record.id, { turns: nextTurns });
  };

  const handleUpdateTurnAction = (
    turnIdx: number,
    actionIdx: number,
    updates: Partial<TurnAction>
  ) => {
    const nextTurns = [...(record.turns || [])];
    nextTurns[turnIdx].actions[actionIdx] = {
      ...nextTurns[turnIdx].actions[actionIdx],
      ...updates,
    };
    updateBattleRecord(record.id, { turns: nextTurns });
  };

  const handleAddTurnAction = (turnIdx: number) => {
    const nextTurns = [...(record.turns || [])];
    const playerFirst = record.lead.filter(Boolean)[0] || "";
    nextTurns[turnIdx].actions.push({
      pokemon: playerFirst,
      isPlayer: true,
      actionType: "move",
      detail: "",
    });
    updateBattleRecord(record.id, { turns: nextTurns });
  };

  const handleDeleteTurn = (turnIdx: number) => {
    const nextTurns = (record.turns || []).filter((_, idx) => idx !== turnIdx);
    updateBattleRecord(record.id, { turns: nextTurns });
  };

  const renderTurnSlotEditControls = (
    tIdx: number,
    actionIdx: number,
    action: TurnAction
  ) => {
    const isMove = action.actionType === "move";
    const activePlayerParty = record.lead.filter(Boolean);
    const activeOpponentParty = record.opponentPokemon.filter(Boolean);

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
            disabled={actionIdx === ((record.turns?.[tIdx]?.actions?.length || 0) - 1)}
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
                  ? rosterNames
                      .filter((name) => name !== action.pokemon)
                      .map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))
                  : record.opponentPokemon
                      .filter((name) => name !== action.pokemon)
                      .map((name) => (
                        <option key={name} value={name}>
                          {name}
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
            const nextTurns = [...(record.turns || [])];
            nextTurns[tIdx].actions = nextTurns[tIdx].actions.filter((_, idx) => idx !== actionIdx);
            updateBattleRecord(record.id, { turns: nextTurns });
          }}
          className="text-white/25 hover:text-[#b22200] text-lg leading-none shrink-0 px-1 hover:bg-[#b22200]/10 rounded transition-colors"
          title="Delete action"
        >
          ×
        </button>
      </div>
    );
  };

  // Turn action renderer
  const renderTurnAction = (action: TurnAction, actionIdx: number) => {
    const isMove = action.actionType === "move";
    const isPlayer = action.isPlayer;

    return (
      <div className="flex items-start sm:items-center gap-2.5 text-xs font-semibold py-1.5 border-b border-white/5 last:border-b-0">
        <div className="text-[10px] text-white/30 font-black tabular-nums w-4 shrink-0">
          {actionIdx + 1}.
        </div>
        {isMove ? (
          <HiOutlineSparkles size={14} className={isPlayer ? "text-sky-400" : "text-rose-400"} />
        ) : (
          <HiOutlineArrowPath size={14} className="text-emerald-400 animate-spin-slow" />
        )}
        <span className="text-white capitalize font-bold">
          {action.pokemon} <span className="text-white/35 font-medium text-[10px] ml-0.5">[{isPlayer ? "User" : "Opp"}]</span>
        </span>
        {isMove ? (
          <>
            <span className="text-white/40 font-normal">used</span>
            <span className="text-white/90 font-bold capitalize bg-white/2 px-1.5 py-0.5 rounded border border-white/5">
              {action.detail || "Unknown Move"}
            </span>
          </>
        ) : (
          <>
            <span className="text-white/40 font-normal">switched out to</span>
            <span className="text-emerald-400 font-bold capitalize bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
              {action.detail || "Unknown Pokémon"}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="rounded-2xl bg-[#161C29] border border-white/5 p-5 flex flex-col gap-4 relative overflow-hidden transition-all hover:border-white/10 duration-200"
      style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.08)" }}
    >
      {/* Background glow card decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/1 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-white font-bold text-sm">Battle Record</span>
          <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider">{record.date}</span>
        </div>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl text-white/30 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all"
          title="Delete record"
        >
          <HiOutlineTrash size={16} />
        </button>
      </div>

      {/* Matchup Grid & Leads Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Player Party Selection */}
        <div className="md:col-span-5 flex flex-col gap-2.5">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
            Your Party
          </span>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((idx) => {
              const currentP = record.lead[idx] || "";
              const currentSprite = getPlayerSprite(currentP);
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center bg-white/2 border border-white/5 rounded-xl p-2.5 gap-2 relative group"
                >
                  {currentP ? (
                    <img
                      src={currentSprite}
                      alt={currentP}
                      className="w-12 h-12 object-contain pointer-events-none"
                      onError={(e) => handlePokemonSpriteError(e, currentP)}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center text-white/10 text-[10px] font-bold">
                      —
                    </div>
                  )}
                  <div className="w-full relative">
                    <select
                      value={currentP}
                      onChange={(e) => handleLeadChange(idx, e.target.value)}
                      className="w-full text-[10px] font-black text-center text-white bg-[#0F1115] border border-white/10 rounded-lg py-1 px-2 appearance-none outline-none cursor-pointer focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="">Select Pokémon...</option>
                      {rosterNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <HiOutlineChevronDown
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                      size={10}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* VS Indicator */}
        <div className="md:col-span-2 flex items-center justify-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/5 bg-white/2 text-[10px] font-black tracking-widest text-[#b22200]">
            VS
          </div>
        </div>

        {/* Opponent Selection & Display */}
        <div className="md:col-span-5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Opponent Party
            </span>
            <span className="text-[10px] font-black text-white/20 tabular-nums">
              {record.opponentPokemon.length} / 4
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-white/2 border border-white/5 rounded-xl p-3 min-h-[160px]">
            {[0, 1, 2, 3].map((idx) => {
              const opp = record.opponentPokemon[idx];
              if (opp) {
                return (
                  <div
                    key={`${opp}-${idx}`}
                    className="relative group flex flex-col items-center bg-black/25 rounded-xl p-2 border border-white/5"
                  >
                    <img
                      src={getShowdownSpriteUrl(opp)}
                      alt={opp}
                      className="w-12 h-12 object-contain pointer-events-none"
                      onError={(e) => handlePokemonSpriteError(e, opp)}
                    />
                    <span className="text-[9px] font-black text-white/55 capitalize truncate max-w-full text-center mt-1">
                      {opp}
                    </span>
                    <button
                      onClick={() => handleRemoveOpponent(idx)}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black cursor-pointer hover:bg-rose-600"
                      title="Remove opponent"
                    >
                      ×
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="relative flex items-center justify-center rounded-xl border border-dashed border-white/10 hover:border-white/30 bg-white/1 p-2"
                >
                  <div className="w-full relative" ref={idx === record.opponentPokemon.length ? dropdownRef : null}>
                    {idx === record.opponentPokemon.length && showAddOpponent ? (
                      <div className="flex flex-col w-full gap-1">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search..."
                          value={opponentSearch}
                          onChange={(e) => setOpponentSearch(e.target.value)}
                          className="w-full text-[10px] bg-[#0F1115] border border-white/15 rounded-lg py-1 px-2 text-white outline-none focus:border-sky-500"
                        />
                        {searchResults.length > 0 && (
                          <div className="absolute left-0 top-full mt-1 bg-[#161C29] border border-white/15 rounded-xl max-h-32 overflow-y-auto z-50 w-full shadow-2xl">
                            {searchResults.map((res) => (
                              <button
                                key={res.id}
                                onClick={() => handleAddOpponent(res.name)}
                                className="w-full flex items-center gap-2 px-2 py-1 text-left text-[10px] hover:bg-white/5 text-white capitalize border-b border-white/5 cursor-pointer"
                              >
                                <img
                                  src={res.spriteUrl}
                                  alt={res.name}
                                  className="w-4 h-4 object-contain"
                                  onError={(e) => handlePokemonSpriteError(e, res.name)}
                                />
                                <span className="truncate">{res.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (idx === record.opponentPokemon.length) {
                            setShowAddOpponent(true);
                          }
                        }}
                        disabled={idx !== record.opponentPokemon.length}
                        className="w-full h-full flex flex-col items-center justify-center text-white/20 hover:text-white/40 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Add opponent species"
                      >
                        <HiOutlinePlus size={16} />
                        <span className="text-[8px] font-bold mt-1">Add Slot {idx + 1}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Collapsible Turns log */}
      {(!record.turns || record.turns.length === 0) ? (
        <div className="border-t border-white/5 pt-3 flex flex-col items-center justify-center gap-2">
          <span className="text-[10px] text-white/20 font-medium">No turns recorded for this battle.</span>
          <button
            onClick={handleAddTurn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/30 hover:border-sky-500/60 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-[10px] font-bold cursor-pointer transition-all"
          >
            <HiOutlinePlus size={12} />
            Add Turn
          </button>
        </div>
      ) : (
        <div className="border-t border-white/5 pt-3">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-xs font-bold text-sky-400/80 hover:text-sky-400 cursor-pointer transition-colors w-fit"
              >
                {expanded ? (
                  <>
                    <HiOutlineChevronUp size={14} />
                    Hide Turns Log ({record.turns.length})
                  </>
                ) : (
                  <>
                    <HiOutlineChevronDown size={14} />
                    View Turns Log ({record.turns.length})
                  </>
                )}
              </button>

              {expanded && (
                <button
                  type="button"
                  onClick={() => setIsEditingTurns(!isEditingTurns)}
                  className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/20 text-white/50 hover:text-white/80 cursor-pointer transition-colors bg-white/2"
                >
                  {isEditingTurns ? "View Readable" : "Edit Log"}
                </button>
              )}
            </div>
          </div>

          {expanded && (
            <div className="flex flex-col gap-3 animate-fade-in pl-1">
              {record.turns.map((turn, tIdx) => {
                return (
                  <div
                    key={tIdx}
                    className="flex flex-col gap-3 bg-[#0F1115]/40 border border-white/5 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                        Turn {tIdx + 1}
                      </span>
                      {isEditingTurns && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTurn(tIdx)}
                          className="text-white/20 hover:text-rose-500 p-0.5 rounded cursor-pointer transition-colors"
                          title="Delete Turn"
                        >
                          <HiOutlineTrash size={12} />
                        </button>
                      )}
                    </div>

                    {isEditingTurns ? (
                      <div className="flex flex-col gap-2">
                        {turn.actions?.map((action, actionIdx) => (
                          <div key={actionIdx}>
                            {renderTurnSlotEditControls(tIdx, actionIdx, action)}
                          </div>
                        ))}
                        {(turn.actions?.length || 0) < 4 && (
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
                    ) : (
                      <div className="flex flex-col bg-[#0F1115]/30 border border-white/5 rounded-xl px-4 py-2">
                        {turn.actions?.map((action, actionIdx) => (
                          <div key={actionIdx}>
                            {renderTurnAction(action, actionIdx)}
                          </div>
                        ))}
                        {(!turn.actions || turn.actions.length === 0) && (
                          <span className="text-[10px] text-white/20 italic p-1">No actions recorded</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Turn Button */}
              <button
                type="button"
                onClick={handleAddTurn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/5 text-white/60 hover:text-white text-[10px] font-bold cursor-pointer transition-all mt-1 w-fit"
              >
                <HiOutlinePlus size={12} />
                Add Turn
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BattleRecordCard;
