import { GameData } from "./main";
import { Ability } from "./abilities";
import { Xtox } from "./parse_utils";
import { TrainerPokemon } from "./trainers/teams";
import { PokePokedex } from "./species/pokedex";

export interface CompactedScripted{
    how: number, // indexed from CompactGameData.ScriptedEncoutersHowT
    map: number, // index from CompactGameData.maps.
}

export interface CompactLocations{
    maps: CompactLocation[],
    landRate: number[],
    waterRate: number[],
    fishRate: number[],
    honeyRate: number[],
    rockRate: number[],
    hiddenRate: number[],
    rodGrade: number[],
}

export interface CompactLocation{
    name: string,
    land: CompactEncounter[] | undefined,
    landR: number | undefined,
    water: CompactEncounter[] | undefined,
    waterR: number | undefined,
    fish: CompactEncounter[] | undefined,
    fishR: number | undefined,
    honey: CompactEncounter[] | undefined,
    honeyR: number | undefined,
    rock: CompactEncounter[] | undefined,
    rockR: number | undefined,
    hidden: CompactEncounter[] | undefined,
    hiddenR: number | undefined,
}

export type CompactEncounter = [
    number, //min
    number, //max
    number, //specie ID
]

export interface CompactEvolution{
    kd: number,
    rs: string,
    in: number,
}

export interface CompactLevelUpMove{
    lv: number,
    id: number,
}

export interface CompactBaseStats{
    base: number[]
    types: number[],
    catchR: number,
    exp: number,
    EVY: number[],
    items: string[] | undefined,
    gender: number,
    eggC: number,
    fren: number,
    grow: number, 
    eggG: number[],
    abis: number[],
    inns: number[],
    col: number,
    noFlip: boolean,
    flags: string,
}

export interface compactMove {
    name: string,
    NAME: string, // i could compactify this even more by string | undefined where undefined mean you can reconstruct the NAME by the name
    sName: string,
    eff: number,
    pwr: number,
    types: number[],
    acc: number,
    pp: number,
    chance: number,
    target: number,
    prio: number,
    flags: number[],
    split: number,
    arg: string,
    desc: string,
    lDesc: string,
    id: number,
}
export interface CompactSpecie{
    NAME: string,
    name: string,
    stats: CompactBaseStats,
    evolutions: CompactEvolution[],
    eggMoves: number[],
    levelUpMoves: CompactLevelUpMove[],
    TMHMMoves: number[],
    tutor: number[],
    forms: number[],
    SEnc:CompactedScripted[], // scripted encounters
    dex: PokePokedex,
    id: number,
    sprite: string,
}

export interface CompactTrainers{
    name: string,
    db: boolean,
    party: CompactTrainerPokemon[],
    insane: CompactTrainerPokemon[],
    rem: CompactTrainerRematch[],
    map: number,
    ptr: string,
    ptrInsane: string,
    ptrRem: string[],
}

export interface CompactTrainerPokemon{
    spc: number,
    abi: number,
    ivs: number[],
    evs: number[],
    item: number,
    nature: number,
    moves: number[]
}

export interface CompactTrainerRematch{
    db: boolean,
    party: CompactTrainerPokemon[]
}

export interface CompactBattleItems{
    name: string,
    NAME: string,
    //could add it? desc: string,
}

export interface CompactGameData{
    abilities: Ability[],
    moves: compactMove[],
    species: CompactSpecie[],
    locations: CompactLocations,
    trainers: CompactTrainers[],
    items: CompactBattleItems[],
    typeT: string[], //types tabes
    targetT: string[], //targets table
    flagsT: string[],
    effT: string[], // effect table
    splitT: string[],
    eggT: string[], // egg group table
    growT: string[]; // Growth Table
    colT: string[], //color table
    evoKindT: string[],
    natureT: string[],
    scriptedEncoutersHowT: string[],
    mapsT: string[],
    projet_root: string,
}
function initCompactGameData(): CompactGameData{
    return {
        abilities: [],
        moves: [],
        species: [],
        locations: {} as CompactLocations,
        trainers: [],
        typeT: [],
        targetT: [],
        flagsT: [],
        effT: [],
        splitT: [],
        eggT: [],
        growT: [],
        colT: [],
        evoKindT: [],
        items: [],
        natureT: [],
        scriptedEncoutersHowT: [],
        mapsT: [],
        projet_root: "",
    }
}


export function compactify(gameData: GameData): CompactGameData{
    const compacted = initCompactGameData()
    const tablize = ((x: unknown, table: unknown[]) => {
        if (!table.includes(x)) table.push(x)
        return table.indexOf(x)
    })
    const abiT: string[] = []
    gameData.abilities.forEach((val, key)=>{
        abiT.push(key)
        compacted.abilities.push(val)
    })
    const itemT: string[] = []
    gameData.battleItems.forEach((val, key)=>{
        itemT.push(key)
        compacted.items.push({
            name: val.name,
            NAME: key
        })
    })
    const movesT: string[] = []
    gameData.moves.forEach((val, key)=>{
        movesT.push(key)
        const move = val
        compacted.moves.push({
            name: move.name,
            NAME: key,
            sName: move.shortName,
            eff: tablize(move.effect, compacted.effT),
            pwr: move.power,
            types: move.types.map((x) => {
                return tablize(x, compacted.typeT)
            }),
            acc: move.acc,
            pp: move.pp,
            chance: move.chance,
            target: tablize(move.target, compacted.targetT),
            prio: move.priority,
            split: tablize(move.split, compacted.splitT),
            flags: move.flags.map((x) => {
                return tablize(x, compacted.flagsT)
            }),
            arg: move.argument,
            desc: move.desc,
            lDesc: move.longDesc,
            id: gameData.movesInternalID.get(key) || 0
        })
    })
    const NAMET: string[] = []
    gameData.species.forEach((val)=>{
        NAMET.push(val.NAME)
    })
    const nameT: string[] = []
    compacted.mapsT = gameData.mapTable
    gameData.species.forEach((val)=>{
        const bs = val.baseStats
        let sEnc: CompactedScripted[] = []
        if (gameData.speciesScripted.has(val.NAME)){
            gameData.speciesScripted.get(val.NAME)?.forEach((value)=>{
                sEnc.push({
                    how: tablize(value.how, compacted.scriptedEncoutersHowT),
                    map: tablize(value.map, compacted.mapsT)
                })
            })
        }
        compacted.species.push({
            name: ((x, X)=>{
                if (nameT.includes(x)){ // because megas are the same names as the non-megas
                    x = Xtox('SPECIES_', X)
                }
                nameT.push(x)
                return x
            })(val.name, val.NAME),
            NAME: val.NAME,
            stats: {
                base:[  bs.baseHP,
                        bs.baseAttack,
                        bs.baseDefense,
                        bs.baseSpAttack,
                        bs.baseSpDefense,
                        bs.baseSpeed,
                    ],
                types: bs.types.map((x) => {
                    return tablize(x, compacted.typeT)
                }),
                catchR: bs.catchRate,
                exp: bs.expYield,
                EVY: [bs.evYield_HP, bs.evYield_Attack, bs.evYield_Defense, bs.evYield_SpAttack, bs.evYield_SpDefense, bs.evYield_Speed],
                items: ((x)=>{
                    if (!x.length){
                        return undefined
                    } else {
                        return x
                    }
                })(bs.items),
                gender: bs.genderRatio,
                eggC: bs.eggCycles,
                fren: bs.friendship,
                grow: tablize(bs.growthRate, compacted.growT), 
                eggG: bs.eggGroup.map((x) => {
                    if (!compacted.eggT.includes(x)) compacted.eggT.push(x)
                    return compacted.eggT.indexOf(x)
                }),
                abis: bs.abilities.map((x) => {
                    if (!abiT.includes(x)) return 0
                    return abiT.indexOf(x)
                }),
                inns: bs.innates.map((x) => {
                    if (!abiT.includes(x)) return 0
                    return abiT.indexOf(x)
                }),
                col: tablize(bs.bodyColor, compacted.colT),
                noFlip: bs.noFlip,
                flags: bs.flags, 
            },
            evolutions: val.evolutions.map((x)=>{
                const evo = {} as CompactEvolution
                if (!compacted.evoKindT.includes(x.kind)) compacted.evoKindT.push(x.kind)
                evo.kd = compacted.evoKindT.indexOf(x.kind)
                evo.rs = x.specifier
                evo.in = NAMET.indexOf(x.into)
                return evo
            }),
            eggMoves: val.eggMoves.map((x) => {
                if (!movesT.includes(x)) return 0
                    return movesT.indexOf(x)
            }),
            levelUpMoves: val.levelUpMoves.map((x) => {
                return {
                    id: ((y)=>{
                        if (!movesT.includes(y)) return 0
                        return movesT.indexOf(y)
                    })(x.move),
                    lv: x.level
                }
            }),
            TMHMMoves: val.TMHMMoves.map((x) => {
                x = x.replace(/((TM)|(HM))[^_]+/, 'MOVE')
                if (x === "MOVE_SOLARBEAM") x = "MOVE_SOLAR_BEAM"
                if (!movesT.includes(x)) {
                    console.warn(`couldn't figure out ${x} TMHM move`)
                }
                return movesT.indexOf(x)
            }),
            tutor: val.tutorMoves.map((x) => {
                if (!movesT.includes(x)) {
                    console.warn(`couldn't figure out ${x} TMHM move`)
                }
                return movesT.indexOf(x)
            }),
            forms: val.forms.map((x)=>{
                return NAMET.indexOf(x)
            }),
            SEnc: sEnc,
            dex: val.dex,
            id: gameData.speciesInternalID.get(val.NAME) || -1,
            sprite: val.sprite
        })
    })
    compacted.locations = {
        landRate: gameData.locations.landRate,
        waterRate: gameData.locations.waterRate,
        fishRate:gameData.locations.fishRate,
        honeyRate: gameData.locations.honeyRate,
        rockRate: gameData.locations.rockRate,
        hiddenRate: gameData.locations.hiddenRate,
        rodGrade: gameData.locations.rodGrade,
        maps: gameData.locations.maps.map((map)=>{
            return {
                name: map.name,
                land: map.land ? map.land.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                landR: map.landR,
                water: map.water ? map.water.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                waterR: map.waterR,
                fish: map.fish ? map.fish.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                fishR: map.fishR,
                honey: map.honey ? map.honey.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                honeyR: map.honeyR,
                rock: map.rock ? map.rock.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                rockR: map.rockR,
                hidden: map.hidden ? map.hidden.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                hiddenR: map.hiddenR,
            }
        })
    }
    const compactPoke = (poke: TrainerPokemon)=>{
        return {
            spc: NAMET.indexOf(poke.specie),
            abi: poke.ability,
            ivs: poke.ivs,
            evs: poke.evs,
            item: tablize(poke.item, itemT),
            nature: ((nat)=>{
                nat = Xtox('NATURE_', nat)
                if (!compacted.natureT.includes(nat))compacted.natureT.push(nat)
                return compacted.natureT.indexOf(nat)
            })(poke.nature),
            moves: poke.moves.map((mv)=>{
                return tablize(mv, movesT)
            })
        }
    }
    gameData.trainers.forEach((trainer, key)=>{
        let category = Xtox('TRAINER_CLASS_', trainer.category)
        let mapName: string = ""
        if (gameData.trainersScripted.has(key)){
            mapName = gameData.trainersScripted.get(key)?.map || ""
        }
        if (!trainer.party.length){
            return
        }
        compacted.trainers.push({
            name: `${category} ${trainer.name}`,
            db: trainer.double,
            party: trainer.party.map(compactPoke),
            insane: trainer.insane.map(compactPoke),
            rem: trainer.rematches.map((rem)=>{
                return {
                    db: rem.double,
                    party: rem.party.map(compactPoke)
                }
            }),
            map: tablize(mapName, compacted.mapsT),
            ptr: trainer.ptr,
            ptrInsane: trainer.ptrInsane,
            ptrRem: trainer.ptrRem,
        })
    })
    compacted.trainers = compacted.trainers.sort((a, b)=>{
        if (a.map < b.map){
            return -1
        } else if (a.map > b.map){
            return 1
        }
        return 0
    })
    return compacted
}