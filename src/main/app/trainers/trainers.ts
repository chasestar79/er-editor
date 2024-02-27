import { GameData } from "../main";
import { autojoinFilePath, getMulFilesData } from "../utils";
import * as TrainerNames from './names'
//import * as Rematches from './rematches'
import * as TrainersTeam from './teams'



export interface Trainer{
    name: string,
    category: string,
    double: boolean,
    party: TrainersTeam.TrainerPokemon[],
    insane: TrainersTeam.TrainerPokemon[],
    rematches: RematchTrainer[],
    ptr: string,
    ptrInsane: string,
    ptrRem: string[],
}

export interface RematchTrainer{
    double: boolean,
    party: TrainersTeam.TrainerPokemon[]
}

function parse(fileData: string): Map<string, Trainer>{
    const lines = fileData.split('\n')
    const TrainerNamesResult = TrainerNames.parse(lines,0)
    //const RematchesResult = Rematches.parse(lines, TrainerNamesResult.fileIterator)
    const TrainersTeamResult = TrainersTeam.parse(lines, TrainerNamesResult.fileIterator)
    const trainers: Map<string, Trainer> = new Map()
    const ptrRems: string[] = []
    TrainerNamesResult.trainers.forEach((value, key)=>{
        trainers.set(value.NAME, {
            name: key,
            category: value.category,
            double: value.double,
            party: TrainersTeamResult.trainers.get(value.partyPtr) || [],
            insane: TrainersTeamResult.trainers.get(value.insanePtr) || [],
            rematches: value.rematches
                .filter((x)=> { 
                    if (TrainersTeamResult.trainers.get(x.partyPtr)){
                        ptrRems.push(x.partyPtr)
                        return TrainersTeamResult.trainers.get(x.partyPtr)?.length || 0 > 0
                    } else {
                        return false
                    }     
                })
                .map((x)=>{
                    return {
                        double: x.double,
                        party: TrainersTeamResult.trainers.get(x.partyPtr) || []
                    }
                }),
            ptr: value.partyPtr,
            ptrInsane: value.insanePtr,
            ptrRem: ptrRems,
        })
    })
    return trainers
}

export function getTrainers(ROOT_PRJ: string, gameData: GameData): Promise<void>{
    return new Promise((resolve: ()=>void, reject)=>{
        const filepaths = autojoinFilePath(ROOT_PRJ, [  'src/data/trainers.h',
                                                        'src/data/trainer_parties.h'])
        getMulFilesData(filepaths, {filterComments: true, filterMacros: true, macros: new Map()})
        .then((fileData)=>{
                gameData.trainers = parse(fileData)
                resolve()
        })
        .catch((reason)=>{
            const err = 'Failed at gettings species reason: ' + reason
            reject(err)
        })
    })
    
}