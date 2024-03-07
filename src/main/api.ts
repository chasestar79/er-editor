import { ipcMain } from 'electron'
import { getGameData } from './app/main'
import { askForFolder } from './app/configuration'
import { setLocation, locationCQ } from './app/locations'
import { replaceEvolution, evoCQ, Evolution } from './app/species/evolutions'
import { modTrainerParty , trainerEditCQ, modTrainer, rmInsane, addInsane, removeTrainer, addTrainer, renameTrainer} from './app/trainers/edit'
import { TrainerPokemon } from './app/trainers/teams'
import { Trainer } from './app/trainers/trainers'
import { addTMHM, removeTMHM, TMHMCQ} from './app/species/tmhm_learnsets'
import { TutorCQ, addTutor, removeTutor } from './app/species/tutor_learnsets'
import { EggMoveCQ, replaceEggMoves } from './app/species/egg_moves'
import { LevelUPLearnsetCQ, LevelUpMove, replaceLearnset} from './app/species/level_up_learnsets'
import { BSCQ, changeAbis, changeBaseStats, changeTypes } from './app/species/base_stats'

export function setupApi(window: Electron.BrowserWindow){
    ipcMain.on('get-game-data', () => {
        getGameData(window)
    })
    ipcMain.on('ask-for-folder', () => {
        askForFolder(window)
    })
    ipcMain.on('set-location', (_event, mapName: string, field: string, monID: number, key: string, value: string | number) => {
        locationCQ.feed(()=>{
            setLocation(mapName, field, monID, key, value)
        }).poll()
    })
    ipcMain.on('change-evolution', (_event, specie: string, evos: Evolution[]) => {
        evoCQ.feed(()=>{
            replaceEvolution(specie, evos)
        }).poll()
    })
    ipcMain.on('mod-trainer-party', (_event, ptr: string, party: TrainerPokemon[]) => {
        trainerEditCQ.feed(()=>{
            modTrainerParty(ptr, party)
        }).poll()
    })

    ipcMain.on('mod-trainer', (_event, trainer: Trainer) => {
        trainerEditCQ.feed(()=>{
            modTrainer(trainer)
        }).poll()
    })
    ipcMain.on('rm-insane', (_event, tNAME: string, ptrInsane: string) => {
        trainerEditCQ.feed(()=>{
            rmInsane(tNAME, ptrInsane)
        }).poll()
    })
    ipcMain.on('add-insane', (_event, tNAME: string, ptrInsane: string, insaneParty: TrainerPokemon[]) => {
        trainerEditCQ.feed(()=>{
            addInsane(tNAME, ptrInsane, insaneParty)
        }).poll()
    })
    ipcMain.on('remove-trainer', (_event, tNAME: string, ptrs: string[], tRematch: string)  => {
        trainerEditCQ.feed(()=>{
            removeTrainer(tNAME, ptrs, tRematch)
        }).poll()
    })
    ipcMain.on('add-trainer', (_event, trainer: Trainer, tRematch: string, tMap: string, tBase: string)  => {
        trainerEditCQ.feed(()=>{
            addTrainer(trainer, tRematch, tMap, tBase)
        }).poll()
    })
    ipcMain.on('rename-trainer', (_event, previous: string, next: string)  => {
        trainerEditCQ.feed(()=>{
            renameTrainer(previous, next)
        }).poll()
    })
    const targetRemoveMove = {
        "tmhm": (specie: string, move:string)=>{
            TMHMCQ.feed(()=>{
                removeTMHM(specie, move)
            }).poll()
        },
        "tutor": (specie: string, move:string)=>{
            TutorCQ.feed(()=>{
                removeTutor(specie, move)
            }).poll()
        },
    }
    ipcMain.on('remove-move', (_event, target: string, specie: string, move:string)  => {
        const targetCall = targetRemoveMove[target]
        if (targetCall) targetCall(specie, move)
    })
    const targetAddMove = {
        "tmhm": (specie: string, move:string)=>{
            TMHMCQ.feed(()=>{
                addTMHM(specie, move)
            }).poll()
        },
        "tutor": (specie: string, move:string)=>{
            TutorCQ.feed(()=>{
                addTutor(specie, move)
            }).poll()
        },
    }
    ipcMain.on('add-move', (_event, target: string, specie: string, move:string)  => {
        const targetCall = targetAddMove[target]
        if (targetCall) targetCall(specie, move)
    })
    ipcMain.on('change-learnset', (_event, ptr: string, moves: LevelUpMove[])  => {
        LevelUPLearnsetCQ.feed(()=>{
            replaceLearnset(ptr, moves)
        }).poll()
    })
    ipcMain.on('change-eggmoves', (_event, specie: string, moves: string[])  => {
        EggMoveCQ.feed(()=>{
            replaceEggMoves(specie, moves)
        }).poll()
    })
    ipcMain.on('change-abis', (_event, specie: string, field: string, abis: string[])  => {
        BSCQ.feed(()=>{
            changeAbis(specie, field === "abis"? "abilities": "innates", abis)
        }).poll()
    })
    ipcMain.on('change-bs', (_event, specie: string, values: number[])  => {
        BSCQ.feed(()=>{
            changeBaseStats(specie, values)
        }).poll()
    })
    ipcMain.on('change-spc-type', (_event, specie: string, types: [string, string])  => {
        BSCQ.feed(()=>{
            changeTypes(specie, types)
        }).poll()
    })
}
