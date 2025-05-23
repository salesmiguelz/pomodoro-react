import { produce } from "immer"

export interface Cycle {
    id: string,
    task: string,
    minutesAmount: number,
    startDate: Date,
    interruptedDate?: Date,
    finishedDate?: Date
}

interface CyclesState {
    cycles: Cycle[],
    activeCycleId: string | null
}

export enum ActionTypes {
    ADD_NEW_CYCLE = 'ADD_NEW_CYCLE',
    INTERRUPT_CURRENT_CYCLE = 'INTERRUPT_CURRENT_CYCLE',
    MARK_CURRENT_CYCLE_AS_FINISHED = 'MARK_CURRENT_CYCLE_AS_FINISHED'
}



export function CyclesReducer(state: CyclesState, action: any) {
    switch (action.type) {
        case ActionTypes.ADD_NEW_CYCLE: {
            return produce(state, draft => {
                draft.cycles.push(action.payload.newCycle);
                draft.activeCycleId = action.payload.newCycle.id;
            })
        }
        case ActionTypes.INTERRUPT_CURRENT_CYCLE: {
            const currentCycleIndex = state.cycles.findIndex(cycle => cycle.id === state.activeCycleId)
            if (currentCycleIndex === -1) {
                return state;
            }
            return produce(state, draft => {
                draft.cycles[currentCycleIndex].interruptedDate = new Date()
                draft.activeCycleId = null;
            })
        }
        case ActionTypes.MARK_CURRENT_CYCLE_AS_FINISHED: {
            const currentCycleIndex = state.cycles.findIndex(cycle => cycle.id === state.activeCycleId)
            if (currentCycleIndex === -1) {
                return state;
            }
            return produce(state, draft => {
                draft.cycles[currentCycleIndex].interruptedDate = new Date()
                draft.activeCycleId = null;
            })
        }
        default:
            return state
    }
}