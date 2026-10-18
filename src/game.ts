import type { Game, InitApi, UpdateApi } from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import * as C from "./constants";
import type {
  EnemyId,
  GemTier,
  OfferId,
  PassiveId,
  PickupKind,
  WeaponId,
} from "./constants";
export type { EnemyId, GemTier, OfferId, PassiveId, PickupKind, WeaponId };

export type Screen =
  | "title"
  | "howto"
  | "almanac"
  | "playing"
  | "levelup"
  | "chest"
  | "paused"
  | "fallen"
  | "dawn";
export type Facing = "left" | "right";
export type ZoneKind =
  "puddle" | "lantern" | "aura" | "slash" | "strike" | "burst";
export type NextDrop = "bread" | "draft" | "none";
export type ChestResult =
  | { readonly kind: "evolve"; readonly weapon: WeaponId }
  | {
      readonly kind: "level";
      readonly item: WeaponId | PassiveId;
      readonly level: number;
    }
  | { readonly kind: "heal" };
export interface PlayerState {
  readonly x: number;
  readonly y: number;
  readonly facing: Facing;
  readonly hp: number;
}
export interface WeaponSlot {
  readonly id: WeaponId;
  readonly level: number;
  readonly cooldown: number;
}
export interface PassiveSlot {
  readonly id: PassiveId;
  readonly level: number;
}
export interface EnemyState {
  readonly id: number;
  readonly type: EnemyId;
  readonly x: number;
  readonly y: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly heading: { readonly x: number; readonly y: number };
  readonly age: number;
  readonly contactCooldown: number;
}
export interface EnemyHit {
  readonly enemy: number;
  readonly cooldown: number;
}
export interface ProjectileState {
  readonly id: number;
  readonly weapon: WeaponId;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly ax: number;
  readonly ay: number;
  readonly radius: number;
  readonly damage: number;
  readonly ttl: number;
  readonly pierce: number;
  readonly hits: readonly EnemyHit[];
}
export interface ZoneState {
  readonly id: number;
  readonly weapon: WeaponId;
  readonly kind: ZoneKind;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly width?: number;
  readonly height?: number;
  readonly damage: number;
  readonly ttl: number | null;
  readonly hits: readonly EnemyHit[];
}
export interface GemState {
  readonly id: number;
  readonly tier: GemTier;
  readonly x: number;
  readonly y: number;
  readonly attracted: boolean;
}
export interface PickupState {
  readonly id: number;
  readonly kind: PickupKind;
  readonly x: number;
  readonly y: number;
}
export interface RunState {
  readonly tick: number;
  readonly level: number;
  readonly xp: number;
  readonly kills: number;
  readonly player: PlayerState;
  readonly hurtFlash: number;
  readonly weapons: readonly WeaponSlot[];
  readonly passives: readonly PassiveSlot[];
  readonly enemies: readonly EnemyState[];
  readonly projectiles: readonly ProjectileState[];
  readonly zones: readonly ZoneState[];
  readonly gems: readonly GemState[];
  readonly pickups: readonly PickupState[];
  readonly offers: readonly OfferId[];
  readonly nextOffers: readonly OfferId[] | null;
  readonly pendingLevelUps: number;
  readonly chestResult: ChestResult | null;
  readonly spawnTimer: number;
  readonly firedEvents: readonly number[];
  readonly nextId: number;
  readonly nextSpawnAngle: number | null;
  readonly nextSwarmAngle: number | null;
  readonly nextSpawnType: EnemyId | null;
  readonly nextPuddleOffset: { readonly x: number; readonly y: number } | null;
  readonly nextStrikeTarget: number | null;
  readonly nextChestItem: WeaponId | PassiveId | null;
  readonly nextDrop: NextDrop | null;
}
export interface WickState {
  readonly screen: Screen;
  readonly menuIndex: number;
  readonly almanacTab: number;
  readonly almanacScroll: number;
  readonly run: RunState;
  readonly accumulator: number;
  readonly simTime: number;
  readonly muted: boolean;
  readonly spawning: boolean;
  readonly events: boolean;
  readonly despawning: boolean;
  readonly enemyMotion: boolean;
  readonly enemyContact: boolean;
  readonly weaponFire: boolean;
  readonly effectMotion: boolean;
  readonly drops: boolean;
  readonly progression: boolean;
}
export interface WickRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const cp = <T>(v: DeepReadonly<T>): T => structuredClone(v) as T;
const ok = (v: boolean, m = "invalid argument") => {
  if (!v) throw new Error(`Wick debug: ${m}`);
};
const num = (n: number) => {
  ok(Number.isFinite(n));
  return n;
};
const pos = (n: number) => {
  ok(Number.isFinite(n) && n >= 0);
  return n;
};
const whole = (n: number, min = 0, max = Infinity) => {
  ok(Number.isInteger(n) && n >= min && n <= max);
  return n;
};
const idle = (): RunState => ({
  tick: 0,
  level: 1,
  xp: 0,
  kills: 0,
  player: { x: 0, y: 0, facing: "right", hp: C.BASE_MAX_HP },
  hurtFlash: 0,
  weapons: [],
  passives: [],
  enemies: [],
  projectiles: [],
  zones: [],
  gems: [],
  pickups: [],
  offers: [],
  nextOffers: null,
  pendingLevelUps: 0,
  chestResult: null,
  spawnTimer: 0,
  firedEvents: [],
  nextId: 0,
  nextSpawnAngle: null,
  nextSwarmAngle: null,
  nextSpawnType: null,
  nextPuddleOffset: null,
  nextStrikeTarget: null,
  nextChestItem: null,
  nextDrop: null,
});
const fresh = (muted = false): WickState => ({
  screen: "title",
  menuIndex: 0,
  almanacTab: 0,
  almanacScroll: 0,
  run: idle(),
  accumulator: 0,
  simTime: 0,
  muted,
  spawning: true,
  events: true,
  despawning: true,
  enemyMotion: true,
  enemyContact: true,
  weaponFire: true,
  effectMotion: true,
  drops: true,
  progression: true,
});
const pl = (r: DeepReadonly<RunState>, id: PassiveId) =>
  r.passives.find((p) => p.id === id)?.level ?? 0;
const derived = (r: DeepReadonly<RunState>) => ({
  maxHp: C.BASE_MAX_HP + C.TALLOW_HP_PER_LEVEL * pl(r, "tallow"),
  armor: C.BRASS_ARMOR_PER_LEVEL * pl(r, "brass"),
  moveSpeed: C.MOVE_SPEED * (1 + C.BELLOWS_SPEED_PER_LEVEL * pl(r, "bellows")),
  pickupRadius: C.PICKUP_RADIUS * (1 + C.LURE_PICKUP_PER_LEVEL * pl(r, "lure")),
  damageMul: 1 + C.WICK_DAMAGE_PER_LEVEL * pl(r, "wick"),
  areaMul: 1 + C.GLASS_AREA_PER_LEVEL * pl(r, "glass"),
  recovery: C.BASE_RECOVERY + C.TINDER_RECOVERY_PER_LEVEL * pl(r, "tinder"),
  xpMul: 1 + C.SOOT_XP_PER_LEVEL * pl(r, "soot"),
});
const need = (l: number) => C.XP_BASE + C.XP_STEP * (l - 1);
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);
const down = (n: number) => (n - C.TICK_DT < C.TICK_DT / 2 ? 0 : n - C.TICK_DT);
const candidates = (r: DeepReadonly<RunState>): OfferId[] => [
  ...C.BASE_WEAPON_IDS.filter((id) => {
    const w = r.weapons.find((x) => x.id === id);
    return w ? w.level < C.MAX_WEAPON_LEVEL : r.weapons.length < C.WEAPON_SLOTS;
  }),
  ...C.PASSIVE_IDS.filter((id) => {
    const p = r.passives.find((x) => x.id === id);
    return p
      ? p.level < C.PASSIVES[id].maxLevel
      : r.passives.length < C.PASSIVE_SLOTS;
  }),
];
const setRun = (
  s: DeepReadonly<WickState>,
  key: keyof RunState,
  value: unknown,
): WickState => ({ ...cp(s), run: { ...cp(s.run), [key]: value } });
const player = (
  s: DeepReadonly<WickState>,
  v: Partial<PlayerState>,
): WickState => ({
  ...cp(s),
  run: { ...cp(s.run), player: { ...s.run.player, ...v } },
});
function spawnEnemy(
  s: DeepReadonly<WickState>,
  type: EnemyId,
  x: number,
  y: number,
): WickState {
  ok((C.ENEMY_IDS as readonly string[]).includes(type));
  const row = C.ENEMIES[type],
    scale =
      row.rank === "common"
        ? 1 + C.HP_SCALE_PER_MINUTE * Math.floor(s.run.tick / C.TICK_HZ / 60)
        : 1,
    hp = row.hp * scale;
  let dx = s.run.player.x - x,
    dy = s.run.player.y - y,
    d = Math.hypot(dx, dy);
  if (!d) {
    dx = s.run.player.facing === "right" ? 1 : -1;
    dy = 0;
    d = 1;
  }
  return {
    ...cp(s),
    run: {
      ...cp(s.run),
      nextId: s.run.nextId + 1,
      enemies: [
        ...s.run.enemies,
        {
          id: s.run.nextId,
          type,
          x: num(x),
          y: num(y),
          hp,
          maxHp: hp,
          heading: { x: dx / d, y: dy / d },
          age: 0,
          contactCooldown: 0,
        },
      ],
    },
  };
}
function mapEnemy(
  s: DeepReadonly<WickState>,
  id: number,
  f: (e: EnemyState) => EnemyState,
) {
  ok(
    s.run.enemies.some((e) => e.id === id),
    "enemy id",
  );
  return setRun(
    s,
    "enemies",
    s.run.enemies.map((e) => (e.id === id ? f(cp(e)) : cp(e))),
  );
}
function menuRects(s: DeepReadonly<WickState>): WickRect[] {
  let n = 0;
  if (s.screen === "title") n = C.TITLE_ITEMS.length;
  else if (s.screen === "levelup") n = s.run.offers.length;
  else if (s.screen === "paused") n = 2;
  else if (s.screen === "fallen" || s.screen === "dawn") n = 2;
  else if (s.screen === "howto" || s.screen === "chest") n = 1;
  else if (s.screen === "almanac")
    n = Math.min(
      C.ALMANAC_ROWS,
      entries(s.almanacTab).length - s.almanacScroll,
    );
  return Array.from({ length: Math.max(0, n) }, (_, i) => ({
    x: s.screen === "almanac" ? 140 : 440,
    y:
      (s.screen === "almanac" ? 190 : 330) +
      i * (s.screen === "almanac" ? 44 : 62),
    width: s.screen === "almanac" ? 420 : 400,
    height: s.screen === "almanac" ? 38 : 50,
  }));
}
const entries = (tab: number): readonly string[] =>
  [
    [...C.BASE_WEAPON_IDS, ...C.EVOLUTION_IDS],
    C.PASSIVE_IDS,
    C.ENEMY_IDS,
    [...C.GEM_TIERS, ...C.PICKUP_KINDS],
  ][tab] ?? [];
const tabRects = (s: DeepReadonly<WickState>): WickRect[] =>
  s.screen !== "almanac"
    ? []
    : C.ALMANAC_TABS.map((_, i) => ({
        x: 130 + i * 250,
        y: 110,
        width: 230,
        height: 52,
      }));
function snap(s: DeepReadonly<WickState>) {
  const d = derived(s.run);
  return {
    version: C.WICK_DEBUG_VERSION,
    screen: s.screen,
    menuIndex: s.menuIndex,
    almanacTab: s.almanacTab,
    almanacScroll: s.almanacScroll,
    spawning: s.spawning,
    events: s.events,
    despawning: s.despawning,
    enemyMotion: s.enemyMotion,
    enemyContact: s.enemyContact,
    weaponFire: s.weaponFire,
    effectMotion: s.effectMotion,
    drops: s.drops,
    progression: s.progression,
    run: {
      ...cp(s.run),
      time: s.run.tick / C.TICK_HZ,
      xpToNext: need(s.run.level),
      maxHp: d.maxHp,
      armor: d.armor,
      moveSpeed: d.moveSpeed,
      pickupRadius: d.pickupRadius,
      pool: s.screen === "levelup" ? candidates(s.run) : [],
      spawnWindow: Math.min(
        19,
        Math.floor(s.run.tick / C.TICK_HZ / C.SPAWN_WINDOW),
      ),
      aliveCommons: s.run.enemies.filter(
        (e) => C.ENEMIES[e.type].rank === "common" && e.type !== "gnat",
      ).length,
    },
    muted: s.muted,
    accumulator: s.accumulator,
    simTime: s.simTime,
  };
}
export type WickSnapshot = ReturnType<typeof snap>;
export interface WickDebugApi {
  readonly version: number;
  reset(s: DeepReadonly<WickState>): WickState;
  snapshot(s: DeepReadonly<WickState>): WickSnapshot;
  reconcile(s: DeepReadonly<WickState>): WickState;
  menuRects(s: DeepReadonly<WickState>): readonly WickRect[];
  tabRects(s: DeepReadonly<WickState>): readonly WickRect[];
  setScreen(s: DeepReadonly<WickState>, n: Screen): WickState;
  choose(s: DeepReadonly<WickState>, i: number): WickState;
  setSpawning(s: DeepReadonly<WickState>, v: boolean): WickState;
  setEvents(s: DeepReadonly<WickState>, v: boolean): WickState;
  setDespawning(s: DeepReadonly<WickState>, v: boolean): WickState;
  setEnemyMotion(s: DeepReadonly<WickState>, v: boolean): WickState;
  setEnemyContact(s: DeepReadonly<WickState>, v: boolean): WickState;
  setWeaponFire(s: DeepReadonly<WickState>, v: boolean): WickState;
  setEffectMotion(s: DeepReadonly<WickState>, v: boolean): WickState;
  setDrops(s: DeepReadonly<WickState>, v: boolean): WickState;
  setProgression(s: DeepReadonly<WickState>, v: boolean): WickState;
  [key: string]: unknown;
}
function choose(s: DeepReadonly<WickState>, i: number): WickState {
  ok(Number.isInteger(i) && i >= 0 && i < s.run.offers.length, "offer index");
  const id = s.run.offers[i],
    r = cp(s.run),
    ws = [...r.weapons],
    ps = [...r.passives];
  let chosenRun = r;
  if (id === C.LAMP_OIL_ID)
    chosenRun = {
      ...r,
      player: {
        ...r.player,
        hp: Math.min(derived(r).maxHp, r.player.hp + C.LAMP_OIL_HEAL),
      },
    };
  else if ((C.BASE_WEAPON_IDS as readonly string[]).includes(id)) {
    const j = ws.findIndex((w) => w.id === id);
    if (j < 0) ws.push({ id: id as WeaponId, level: 1, cooldown: 0 });
    else ws[j] = { ...ws[j], level: ws[j].level + 1 };
  } else {
    const j = ps.findIndex((p) => p.id === id);
    if (j < 0) ps.push({ id: id as PassiveId, level: 1 });
    else ps[j] = { ...ps[j], level: ps[j].level + 1 };
  }
  const pending = r.pendingLevelUps - 1;
  return {
    ...cp(s),
    screen: pending ? "levelup" : "playing",
    menuIndex: 0,
    accumulator: 0,
    run: {
      ...chosenRun,
      weapons: ws,
      passives: ps,
      pendingLevelUps: pending,
      offers: pending
        ? candidates({ ...r, weapons: ws, passives: ps }).slice(0, 3)
        : [],
    },
  };
}
function debug(): WickDebugApi {
  const sw =
    (k: keyof WickState) => (s: DeepReadonly<WickState>, v: boolean) => {
      ok(typeof v === "boolean");
      return { ...cp(s), [k]: v };
    };
  const add = (
    s: DeepReadonly<WickState>,
    k: "gems" | "pickups",
    e: GemState | PickupState,
  ) => ({
    ...cp(s),
    run: { ...cp(s.run), [k]: [...s.run[k], e], nextId: s.run.nextId + 1 },
  });
  return {
    version: 1,
    reset: (s: DeepReadonly<WickState>) => fresh(s.muted),
    snapshot: snap,
    reconcile: cp,
    menuRects,
    tabRects,
    setScreen: (s: DeepReadonly<WickState>, n: Screen) => {
      ok(
        [
          "title",
          "howto",
          "almanac",
          "playing",
          "levelup",
          "chest",
          "paused",
          "fallen",
          "dawn",
        ].includes(n),
      );
      return {
        ...cp(s),
        screen: n,
        menuIndex: 0,
        almanacTab: 0,
        almanacScroll: 0,
        accumulator: n === "playing" ? s.accumulator : 0,
      };
    },
    choose,
    setSpawning: sw("spawning"),
    setEvents: sw("events"),
    setDespawning: sw("despawning"),
    setEnemyMotion: sw("enemyMotion"),
    setEnemyContact: sw("enemyContact"),
    setWeaponFire: sw("weaponFire"),
    setEffectMotion: sw("effectMotion"),
    setDrops: sw("drops"),
    setProgression: sw("progression"),
    setTick: (s: DeepReadonly<WickState>, n: number) =>
      setRun(s, "tick", whole(n, 0, C.DAWN_TIME * C.TICK_HZ - 1)),
    setSpawnTimer: (s: DeepReadonly<WickState>, n: number) =>
      setRun(s, "spawnTimer", pos(n)),
    setNextSpawnAngle: (s: DeepReadonly<WickState>, n: number) => {
      ok(n >= 0 && n < 360);
      return setRun(s, "nextSpawnAngle", n);
    },
    setNextSwarmAngle: (s: DeepReadonly<WickState>, n: number) => {
      ok(n >= 0 && n < 360);
      return setRun(s, "nextSwarmAngle", n);
    },
    setNextSpawnType: (s: DeepReadonly<WickState>, id: EnemyId) =>
      setRun(s, "nextSpawnType", id),
    setNextPuddleOffset: (s: DeepReadonly<WickState>, x: number, y: number) => {
      ok(Math.hypot(x, y) <= C.OIL_SCATTER);
      return setRun(s, "nextPuddleOffset", { x: num(x), y: num(y) });
    },
    setNextStrikeTarget: (s: DeepReadonly<WickState>, id: number) => {
      ok(s.run.enemies.some((e) => e.id === id));
      return setRun(s, "nextStrikeTarget", id);
    },
    setNextChestItem: (s: DeepReadonly<WickState>, id: WeaponId | PassiveId) =>
      setRun(s, "nextChestItem", id),
    setNextDrop: (s: DeepReadonly<WickState>, v: NextDrop) => {
      ok(["bread", "draft", "none"].includes(v));
      return setRun(s, "nextDrop", v);
    },
    rollDrop: () =>
      Math.random() < C.BREAD_CHANCE
        ? "bread"
        : Math.random() < C.DRAFT_CHANCE
          ? "draft"
          : "none",
    setPlayerPosition: (s: DeepReadonly<WickState>, x: number, y: number) =>
      player(s, { x: num(x), y: num(y) }),
    setFacing: (s: DeepReadonly<WickState>, f: Facing) => {
      ok(f === "left" || f === "right");
      return player(s, { facing: f });
    },
    setHp: (s: DeepReadonly<WickState>, n: number) => player(s, { hp: num(n) }),
    setLevel: (s: DeepReadonly<WickState>, n: number) =>
      setRun(s, "level", whole(n, 1)),
    setXp: (s: DeepReadonly<WickState>, n: number) => setRun(s, "xp", pos(n)),
    setKills: (s: DeepReadonly<WickState>, n: number) =>
      setRun(s, "kills", whole(n)),
    setPendingLevelUps: (s: DeepReadonly<WickState>, n: number) =>
      setRun(s, "pendingLevelUps", whole(n)),
    setNextOffers: (s: DeepReadonly<WickState>, ids: readonly OfferId[]) => {
      ok(ids.length > 0 && ids.length <= 3 && new Set(ids).size === ids.length);
      return setRun(s, "nextOffers", [...ids]);
    },
    setWeapon: (
      s: DeepReadonly<WickState>,
      slot: number,
      id: WeaponId,
      level: number,
    ) => {
      ok(
        slot >= 0 &&
          slot <= s.run.weapons.length &&
          slot < C.WEAPON_SLOTS &&
          Number.isInteger(slot),
      );
      ok(
        level >= 1 &&
          level <=
            ((C.EVOLUTION_IDS as readonly string[]).includes(id)
              ? 1
              : C.MAX_WEAPON_LEVEL),
      );
      const a = s.run.weapons.map((w) => ({ ...w }));
      a[slot] = {
        id,
        level,
        cooldown: a[slot]?.id === id ? a[slot].cooldown : 0,
      };
      return setRun(s, "weapons", a);
    },
    setWeaponCooldown: (
      s: DeepReadonly<WickState>,
      slot: number,
      n: number,
    ) => {
      ok(slot >= 0 && slot < s.run.weapons.length);
      return setRun(
        s,
        "weapons",
        s.run.weapons.map((w, i) =>
          i === slot ? { ...w, cooldown: pos(n) } : { ...w },
        ),
      );
    },
    removeWeapon: (s: DeepReadonly<WickState>, i: number) => {
      ok(i >= 0 && i < s.run.weapons.length);
      return setRun(
        s,
        "weapons",
        s.run.weapons.filter((_, j) => i !== j),
      );
    },
    setPassive: (
      s: DeepReadonly<WickState>,
      slot: number,
      id: PassiveId,
      level: number,
    ) => {
      ok(
        slot >= 0 &&
          slot <= s.run.passives.length &&
          slot < C.PASSIVE_SLOTS &&
          level >= 1 &&
          level <= C.PASSIVES[id].maxLevel,
      );
      const a = s.run.passives.map((p) => ({ ...p }));
      a[slot] = { id, level };
      return setRun(s, "passives", a);
    },
    removePassive: (s: DeepReadonly<WickState>, i: number) => {
      ok(i >= 0 && i < s.run.passives.length);
      return setRun(
        s,
        "passives",
        s.run.passives.filter((_, j) => i !== j),
      );
    },
    spawnEnemy,
    setEnemyPosition: (
      s: DeepReadonly<WickState>,
      id: number,
      x: number,
      y: number,
    ) => mapEnemy(s, id, (e) => ({ ...e, x: num(x), y: num(y) })),
    setEnemyHp: (s: DeepReadonly<WickState>, id: number, n: number) => {
      ok(n > 0);
      return mapEnemy(s, id, (e) => ({ ...e, hp: num(n) }));
    },
    setEnemyHeading: (
      s: DeepReadonly<WickState>,
      id: number,
      x: number,
      y: number,
    ) => {
      const d = Math.hypot(x, y);
      ok(d > 0);
      return mapEnemy(s, id, (e) => ({
        ...e,
        heading: { x: x / d, y: y / d },
      }));
    },
    setEnemyAge: (s: DeepReadonly<WickState>, id: number, n: number) =>
      mapEnemy(s, id, (e) => ({ ...e, age: pos(n) })),
    setEnemyContactCooldown: (
      s: DeepReadonly<WickState>,
      id: number,
      n: number,
    ) => mapEnemy(s, id, (e) => ({ ...e, contactCooldown: pos(n) })),
    removeEnemy: (s: DeepReadonly<WickState>, id: number) => {
      ok(s.run.enemies.some((e) => e.id === id));
      return setRun(
        s,
        "enemies",
        s.run.enemies.filter((e) => e.id !== id),
      );
    },
    clearEnemies: (s: DeepReadonly<WickState>) => setRun(s, "enemies", []),
    clearProjectiles: (s: DeepReadonly<WickState>) =>
      setRun(s, "projectiles", []),
    clearZones: (s: DeepReadonly<WickState>) => setRun(s, "zones", []),
    spawnGem: (
      s: DeepReadonly<WickState>,
      tier: GemTier,
      x: number,
      y: number,
    ) =>
      add(s, "gems", {
        id: s.run.nextId,
        tier,
        x: num(x),
        y: num(y),
        attracted: false,
      }),
    setGemAttracted: (s: DeepReadonly<WickState>, id: number, v: boolean) => {
      ok(s.run.gems.some((g) => g.id === id));
      return setRun(
        s,
        "gems",
        s.run.gems.map((g) =>
          g.id === id ? { ...g, attracted: v } : { ...g },
        ),
      );
    },
    clearGems: (s: DeepReadonly<WickState>) => setRun(s, "gems", []),
    spawnPickup: (
      s: DeepReadonly<WickState>,
      kind: PickupKind,
      x: number,
      y: number,
    ) => add(s, "pickups", { id: s.run.nextId, kind, x: num(x), y: num(y) }),
    clearPickups: (s: DeepReadonly<WickState>) => setRun(s, "pickups", []),
  } as unknown as WickDebugApi;
}

const images = new Map<string, ImageBitmap>();
export const BACKGROUND = "#090b17";
async function load(api: InitApi<WickState>) {
  const paths = [
    C.LAMPLIGHTER_IDLE_PATH,
    ...Array.from(
      { length: 6 },
      (_, i) => `${C.LAMPLIGHTER_WALK_SHEET.dir}/${i}.png`,
    ),
    ...C.ENEMY_IDS.flatMap((id) =>
      Array.from(
        { length: 4 },
        (_, i) => `${C.ENEMY_SHEET_DIR}/${id}/${i}.png`,
      ),
    ),
    ...Array.from({ length: 4 }, (_, i) => `${C.PUFF_SHEET.dir}/${i}.png`),
    ...Object.values(C.GEM_PATHS),
    ...Object.values(C.PICKUP_PATHS),
    C.GROUND_TILE_PATH,
    ...Object.values(C.EFFECT_SPRITES).flatMap((e) =>
      e.frames === 1
        ? [e.path]
        : Array.from({ length: e.frames }, (_, i) => `${e.path}/${i}.png`),
    ),
    ...Object.values(C.ICON_PATHS),
  ];
  await Promise.all(
    paths.map(async (p) => images.set(p, await api.assets.loadImage(p))),
  );
  await Promise.all(
    Object.entries(C.CUE_PATHS).map(([n, p]) => api.audio.load(n, p)),
  );
}
function openLevel(s: WickState): WickState {
  const p = candidates(s.run),
    offers: OfferId[] =
      s.run.nextOffers && s.run.nextOffers.every((x) => p.includes(x))
        ? [...s.run.nextOffers]
        : p.length
          ? p
              .slice()
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
          : [C.LAMP_OIL_ID];
  return {
    ...s,
    screen: "levelup" as Screen,
    menuIndex: 0,
    accumulator: 0,
    run: { ...s.run, offers, nextOffers: null },
  };
}
function tick(s: WickState, api: UpdateApi): WickState {
  let r = cp(s.run);
  const s0 = derived(r);
  r = { ...r, tick: r.tick + 1 };
  const dx = api.input.value("right") - api.input.value("left"),
    dy = api.input.value("down") - api.input.value("up"),
    len = Math.hypot(dx, dy);
  r = {
    ...r,
    player: {
      ...r.player,
      x: r.player.x + (len ? dx / len : 0) * s0.moveSpeed * C.TICK_DT,
      y: r.player.y + (len ? dy / len : 0) * s0.moveSpeed * C.TICK_DT,
      facing: dx < 0 ? "left" : dx > 0 ? "right" : r.player.facing,
      hp: Math.min(s0.maxHp, r.player.hp + s0.recovery * C.TICK_DT),
    },
    hurtFlash: down(r.hurtFlash),
  };
  let es = r.enemies.map((e) => {
    let h = e.heading,
      x = e.x,
      y = e.y;
    if (s.enemyMotion) {
      if (C.ENEMIES[e.type].behavior !== "drift") {
        const d = Math.hypot(r.player.x - x, r.player.y - y) || 1;
        h = { x: (r.player.x - x) / d, y: (r.player.y - y) / d };
      }
      x += h.x * C.ENEMIES[e.type].speed * C.TICK_DT;
      y += h.y * C.ENEMIES[e.type].speed * C.TICK_DT;
    }
    return {
      ...e,
      x,
      y,
      heading: h,
      age: e.age + C.TICK_DT,
      contactCooldown: down(e.contactCooldown),
    };
  });
  if (s.despawning)
    es = es.filter(
      (e) =>
        C.ENEMIES[e.type].rank !== "common" ||
        distance(e, r.player) <= C.DESPAWN_DISTANCE,
    );
  let hp = r.player.hp,
    hurt = false;
  es = es.map((e) => {
    if (
      s.enemyContact &&
      e.contactCooldown === 0 &&
      distance(e, r.player) < C.ENEMIES[e.type].radius + C.PLAYER_RADIUS
    ) {
      hp -= Math.max(1, C.ENEMIES[e.type].damage - s0.armor);
      hurt = true;
      return { ...e, contactCooldown: C.CONTACT_COOLDOWN };
    }
    return e;
  });
  if (hurt) api.audio.play(C.CUES.hurt);
  r = {
    ...r,
    enemies: es,
    player: { ...r.player, hp },
    hurtFlash: hurt ? C.HURT_FLASH : r.hurtFlash,
    projectiles: r.projectiles
      .map((p) => ({
        ...p,
        ttl: down(p.ttl),
        x: s.effectMotion ? p.x + p.vx * C.TICK_DT : p.x,
        y: s.effectMotion ? p.y + p.vy * C.TICK_DT : p.y,
      }))
      .filter((p) => p.ttl > 0),
    zones: r.zones
      .map((z) => ({ ...z, ttl: z.ttl === null ? null : down(z.ttl) }))
      .filter((z) => z.ttl === null || z.ttl > 0),
  };
  let chest = false,
    xp = r.xp,
    gems = [...r.gems];
  const pickups = r.pickups.filter((p) => {
    if (
      distance(p, r.player) < C.PICKUP_ITEM_RADIUS + C.PLAYER_RADIUS &&
      (!chest || p.kind !== "chest")
    ) {
      if (p.kind === "bread") hp = Math.min(s0.maxHp, hp + C.BREAD_HEAL);
      if (p.kind === "draft")
        gems = gems.map((g) => ({ ...g, attracted: true }));
      if (p.kind === "chest") chest = true;
      api.audio.play(C.CUES.pickup);
      return false;
    }
    return true;
  });
  gems = gems
    .map((g) => {
      const attracted = g.attracted || distance(g, r.player) <= s0.pickupRadius;
      let x = g.x,
        y = g.y;
      const d = distance(g, r.player);
      if (attracted && d) {
        const m = Math.min(d, C.GEM_SPEED * C.TICK_DT);
        x += ((r.player.x - x) / d) * m;
        y += ((r.player.y - y) / d) * m;
      }
      return { ...g, x, y, attracted };
    })
    .filter((g) => {
      if (distance(g, r.player) <= C.COLLECT_RADIUS) {
        xp += C.GEM_VALUES[g.tier] * s0.xpMul;
        api.audio.play(C.CUES.gem);
        return false;
      }
      return true;
    });
  let level = r.level,
    pending = r.pendingLevelUps;
  if (s.progression)
    while (xp >= need(level)) {
      xp -= need(level++);
      pending++;
      api.audio.play(C.CUES.levelUp);
    }
  r = {
    ...r,
    player: { ...r.player, hp },
    pickups,
    gems,
    xp,
    level,
    pendingLevelUps: pending,
  };
  if (s.spawning) {
    let st = down(r.spawnTimer);
    const wi = Math.min(19, Math.floor(r.tick / C.TICK_HZ / C.SPAWN_WINDOW)),
      w = C.SPAWN_WINDOWS[wi];
    if (
      st === 0 &&
      r.enemies.filter(
        (e) => e.type !== "gnat" && C.ENEMIES[e.type].rank === "common",
      ).length < w.cap
    ) {
      const type =
          r.nextSpawnType && w.types.includes(r.nextSpawnType)
            ? r.nextSpawnType
            : w.types[Math.floor(Math.random() * w.types.length)],
        a = ((r.nextSpawnAngle ?? Math.random() * 360) * Math.PI) / 180;
      const q = spawnEnemy(
        { ...s, run: r },
        type,
        r.player.x + Math.cos(a) * C.SPAWN_DISTANCE,
        r.player.y + Math.sin(a) * C.SPAWN_DISTANCE,
      );
      r = { ...q.run, nextSpawnAngle: null, nextSpawnType: null };
      st = w.interval;
    }
    r = { ...r, spawnTimer: st };
  }
  const out = { ...s, run: r };
  if (r.tick >= C.DAWN_TIME * C.TICK_HZ) {
    api.audio.play(C.CUES.dawn);
    return { ...out, screen: "dawn", accumulator: 0 };
  }
  if (r.player.hp <= 0) {
    api.audio.play(C.CUES.fallen);
    return { ...out, screen: "fallen", accumulator: 0 };
  }
  if (chest) {
    api.audio.play(C.CUES.chest);
    return {
      ...out,
      screen: "chest",
      accumulator: 0,
      run: {
        ...r,
        chestResult: { kind: "heal" },
        player: {
          ...r.player,
          hp: Math.min(s0.maxHp, r.player.hp + C.CHEST_HEAL),
        },
      },
    };
  }
  if (pending) return openLevel(out);
  return out;
}
function menus(s: WickState, api: UpdateApi): WickState {
  const rs = menuRects(s),
    p = api.input.pointer();
  let i = s.menuIndex;
  const h = rs.findIndex(
    (r) =>
      p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height,
  );
  if (h >= 0) i = h;
  if (api.input.pressed("up") && rs.length) i = (i + rs.length - 1) % rs.length;
  if (api.input.pressed("down") && rs.length) i = (i + 1) % rs.length;
  const go = api.input.pressed("confirm") || api.input.pointerReleased();
  if (s.screen === "title" && go)
    return i === 0
      ? {
          ...s,
          screen: "playing" as Screen,
          run: {
            ...idle(),
            weapons: [{ id: "taper" as WeaponId, level: 1, cooldown: 0 }],
          },
        }
      : i === 1
        ? { ...s, screen: "howto" as Screen, menuIndex: 0 }
        : { ...s, screen: "almanac" as Screen, menuIndex: 0 };
  if (s.screen === "levelup" && go) return choose(s, i);
  if (
    (s.screen === "howto" || s.screen === "almanac") &&
    (go || api.input.pressed("back"))
  )
    return {
      ...s,
      screen: "title" as Screen,
      menuIndex: s.screen === "howto" ? 1 : 2,
    };
  if (s.screen === "chest" && go)
    return {
      ...s,
      screen: "playing" as Screen,
      run: { ...s.run, chestResult: null },
    };
  if (s.screen === "paused" && go)
    return i ? fresh(s.muted) : { ...s, screen: "playing" as Screen };
  if ((s.screen === "fallen" || s.screen === "dawn") && go)
    return i
      ? fresh(s.muted)
      : {
          ...s,
          screen: "playing" as Screen,
          run: {
            ...idle(),
            weapons: [{ id: "taper" as WeaponId, level: 1, cooldown: 0 }],
          },
        };
  return { ...s, menuIndex: i };
}
function text(
  c: CanvasRenderingContext2D,
  t: string,
  x: number,
  y: number,
  n = 28,
  col = "#f5d887",
  a: CanvasTextAlign = "center",
) {
  c.fillStyle = col;
  c.font = `bold ${n}px Georgia,serif`;
  c.textAlign = a;
  c.fillText(t, x, y);
}
function image(
  c: CanvasRenderingContext2D,
  p: string,
  x: number,
  y: number,
  w?: number,
  h?: number,
) {
  const i = images.get(p);
  if (i)
    c.drawImage(
      i,
      x - (w ?? i.width) / 2,
      y - (h ?? i.height) / 2,
      w ?? i.width,
      h ?? i.height,
    );
}
function world(s: DeepReadonly<WickState>, c: CanvasRenderingContext2D) {
  const p = s.run.player,
    tx = (x: number) => x - p.x + C.STAGE_CX,
    ty = (y: number) => y - p.y + C.STAGE_CY;
  for (let x = Math.floor((p.x - 640) / 64) * 64; x < p.x + 640; x += 64)
    for (let y = Math.floor((p.y - 360) / 64) * 64; y < p.y + 360; y += 64)
      image(c, C.GROUND_TILE_PATH, tx(x + 32), ty(y + 32));
  for (const g of s.run.gems) image(c, C.GEM_PATHS[g.tier], tx(g.x), ty(g.y));
  for (const q of s.run.pickups)
    image(c, C.PICKUP_PATHS[q.kind], tx(q.x), ty(q.y));
  for (const e of s.run.enemies)
    image(
      c,
      `${C.ENEMY_SHEET_DIR}/${e.type}/${Math.floor(e.age / 0.1) % 4}.png`,
      tx(e.x),
      ty(e.y),
    );
  image(c, C.LAMPLIGHTER_IDLE_PATH, 640, 360);
  const g = c.createRadialGradient(640, 360, 20, 640, 360, 280);
  g.addColorStop(0, "rgba(255,214,108,.05)");
  g.addColorStop(1, "rgba(0,0,10,.72)");
  c.fillStyle = g;
  c.fillRect(0, 0, 1280, 720);
  c.fillStyle = "#351722";
  c.fillRect(25, 22, 360, 18);
  c.fillStyle = "#d44e58";
  c.fillRect(25, 22, 360 * Math.max(0, p.hp / derived(s.run).maxHp), 18);
  text(
    c,
    `${Math.floor(s.run.tick / 3600)}:${String(Math.floor(s.run.tick / 60) % 60).padStart(2, "0")}`,
    640,
    40,
    25,
  );
  text(
    c,
    `LEVEL ${s.run.level}   •   ${s.run.kills} FOES`,
    25,
    76,
    18,
    "#e5d4a7",
    "left",
  );
}
function panel(c: CanvasRenderingContext2D, t: string, sub = "") {
  c.fillStyle = "rgba(6,8,18,.93)";
  c.fillRect(290, 85, 700, 550);
  c.strokeStyle = "#d5a64b";
  c.lineWidth = 3;
  c.strokeRect(302, 97, 676, 526);
  text(c, t, 640, 180, 52);
  text(c, sub, 640, 225, 20, "#9eb2c9");
}
export const game: Game<WickState, WickDebugApi> = {
  async initialize(api) {
    for (const a of C.ACTIONS)
      api.input.register(a, { keys: [...C.BINDINGS[a]] });
    await load(api);
    api.diagnostics.register("screen", (s) => s.screen);
    api.diagnostics.register("clock", (s) => (s.run.tick / 60).toFixed(1));
    api.diagnostics.register(
      "level",
      (s) => `${s.run.level} ${s.run.xp}/${need(s.run.level)}`,
    );
    api.diagnostics.register(
      "hp",
      (s) => `${s.run.player.hp}/${derived(s.run).maxHp}`,
    );
    api.diagnostics.register("enemies", (s) => s.run.enemies.length);
    return [fresh(), debug()];
  },
  update(state, api, dt) {
    let s: WickState = {
      ...cp(state),
      simTime: state.simTime + dt,
      muted: api.audio.muted(),
    };
    if (api.input.pressed("mute")) api.audio.setMuted(!api.audio.muted());
    if (s.screen === "playing" && api.input.pressed("pause"))
      s = { ...s, screen: "paused", accumulator: 0 };
    else if (s.screen !== "playing") s = menus(s, api);
    if (s.screen === "playing") {
      if (!api.audio.looping(C.CUES.music)) api.audio.loop(C.CUES.music);
      if (!api.audio.looping(C.CUES.hum)) api.audio.loop(C.CUES.hum);
      let a = s.accumulator + dt;
      while (a >= C.TICK_DT - C.TICK_EPSILON && s.screen === "playing") {
        a -= C.TICK_DT;
        s = tick(s, api);
      }
      s = {
        ...s,
        accumulator:
          s.screen === "playing" && Math.abs(a) >= C.TICK_EPSILON ? a : 0,
      };
    } else {
      api.audio.stop(C.CUES.music);
      api.audio.stop(C.CUES.hum);
      s = { ...s, accumulator: 0 };
    }
    return { ...s, muted: api.audio.muted() };
  },
  render(s, api) {
    const c = api.ctx;
    c.imageSmoothingEnabled = false;
    if (!["title", "howto", "almanac"].includes(s.screen)) world(s, c);
    if (s.screen === "title") {
      c.fillStyle = BACKGROUND;
      c.fillRect(0, 0, 1280, 720);
      const g = c.createRadialGradient(640, 330, 20, 640, 330, 440);
      g.addColorStop(0, "#3c2940");
      g.addColorStop(1, BACKGROUND);
      c.fillStyle = g;
      c.fillRect(0, 0, 1280, 720);
      text(c, C.TITLE_TEXT, 640, 195, 112);
      text(c, C.TAGLINE_TEXT, 640, 245, 22, "#b8c6da");
    }
    if (s.screen === "howto")
      panel(
        c,
        "HOW TO PLAY",
        "Move. Your tools fire themselves. Survive until dawn.",
      );
    if (s.screen === "almanac") {
      panel(c, C.ALMANAC_TEXT, "Tools • Trinkets • Creatures • Finds");
      entries(s.almanacTab)
        .slice(0, 10)
        .forEach((v, i) =>
          text(c, v.toUpperCase(), 170, 220 + i * 36, 18, "#ddcfaa", "left"),
        );
    }
    if (s.screen === "levelup")
      panel(c, C.LEVEL_UP_TEXT, "Choose what the flame learns");
    if (s.screen === "chest") panel(c, C.CHEST_TEXT, "The night yields a gift");
    if (s.screen === "paused") panel(c, C.PAUSED_TEXT);
    if (s.screen === "fallen")
      panel(c, C.FALLEN_TEXT, `Level ${s.run.level} • ${s.run.kills} foes`);
    if (s.screen === "dawn")
      panel(c, C.DAWN_TEXT, "You carried the flame through the night");
    menuRects(s).forEach((r, i) => {
      c.fillStyle =
        i === s.menuIndex ? "rgba(220,166,67,.3)" : "rgba(35,42,60,.7)";
      c.fillRect(r.x, r.y, r.width, r.height);
      c.strokeStyle = i === s.menuIndex ? "#f3ce77" : "#59657b";
      c.strokeRect(r.x, r.y, r.width, r.height);
      let label = "CONTINUE";
      if (s.screen === "title") label = C.TITLE_ITEMS[i];
      else if (s.screen === "levelup")
        label = s.run.offers[i]?.toUpperCase() ?? "";
      else if (s.screen === "paused") label = C.PAUSE_ITEMS[i];
      else if (s.screen === "fallen" || s.screen === "dawn")
        label = C.END_ITEMS[i];
      text(c, label, r.x + r.width / 2, r.y + 34, 20);
    });
  },
};
