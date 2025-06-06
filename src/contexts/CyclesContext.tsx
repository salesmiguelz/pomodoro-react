import { createContext, ReactNode, useEffect, useReducer, useState } from "react";
import { ActionTypes, Cycle, CyclesReducer } from "../reducers/cycles";
import { differenceInSeconds } from "date-fns";

interface CreateCycleData {
    task: string,
    minutesAmount: number
}

interface CyclesContextType {
    cycles: Cycle[],
    activeCycle: Cycle | undefined,
    activeCycleId: string | null,
    amountSecondsPassed: number,
    markCurrentCycleAsFinished: () => void,
    setSecondsPassed: (seconds: number) => void,
    createNewCycle: (data: CreateCycleData) => void,
    interruptCurrentCycle: () => void
}


interface CyclesContextProviderProps {
    children: ReactNode
}

export const CyclesContext = createContext({} as CyclesContextType)


export function CyclesContextProvider({ children }: CyclesContextProviderProps) {
    const [cyclesState, dispatch] = useReducer(CyclesReducer, {
        cycles: [],
        activeCycleId: null
    }, (initialState) => {
        const storedStateAsJSON = localStorage.getItem('@rocket-timer:cycles-state-1.0.0');

        if (storedStateAsJSON) {
            return JSON.parse(storedStateAsJSON)
        }
        return initialState
    });
    const { cycles, activeCycleId } = cyclesState;
    const activeCycle = cycles.find(cycle => cycle.id === activeCycleId)

    const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
        if (activeCycle) {
            return differenceInSeconds(
                new Date(),
                new Date(activeCycle.startDate)
            );
        }

        return 0
    });

    useEffect(() => {
        const stateJSON = JSON.stringify(cyclesState)

        localStorage.setItem('@rocket-timer:cycles-state-1.0.0', stateJSON)
    }, [cyclesState])





    function setSecondsPassed(secondsPassed: number) {
        setAmountSecondsPassed(secondsPassed)
    }

    function markCurrentCycleAsFinished() {
        dispatch({
            type: ActionTypes.MARK_CURRENT_CYCLE_AS_FINISHED,
            payload: {
                activeCycleId
            }
        })
    }

    function createNewCycle(data: CreateCycleData) {
        const id = crypto.randomUUID()
        const newCycle: Cycle = {
            id,
            task: data.task,
            minutesAmount: data.minutesAmount,
            startDate: new Date()
        }

        dispatch({
            type: ActionTypes.ADD_NEW_CYCLE,
            payload: {
                newCycle
            }
        })
        setAmountSecondsPassed(0);
    }

    function interruptCurrentCycle() {
        dispatch({
            type: ActionTypes.INTERRUPT_CURRENT_CYCLE,
            payload: {
                activeCycleId
            }
        })
    }

    return (
        <CyclesContext.Provider value={{ activeCycle, activeCycleId, markCurrentCycleAsFinished, amountSecondsPassed, setSecondsPassed, createNewCycle, interruptCurrentCycle, cycles }}>
            {children}
        </CyclesContext.Provider>
    )
}