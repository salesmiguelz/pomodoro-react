import { HandPalm, Play } from "phosphor-react";
import { HomeContainer, StartCountdownButton, StopCountdownButton } from "./styles";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createContext, useState } from "react";
import { NewCycleForm } from "../Home/NewCycleForm";
import { Countdown } from "../Home/Countdown";

interface Cycle {
    id: string,
    task: string,
    minutesAmount: number,
    startDate: Date,
    interruptedDate?: Date,
    finishedDate?: Date
}
interface CyclesContextType {
    activeCycle: Cycle | undefined,
    activeCycleId: string | null,
    amountSecondsPassed: number,
    markCurrentCycleAsFinished: () => void,
    setSecondsPassed: (seconds: number) => void
}
export const CyclesContext = createContext({} as CyclesContextType)

const newCycleFormValidationSchema = z.object({
    task: z.string().min(1, 'Informe a tarefa'),
    minutesAmount: z.number().min(1, 'O ciclo precisa ser de no mínimo 1 minuto.').max(60, 'O ciclo precisa ser de no máximo 60 minutos.')
})

type NewCycleFormData = z.infer<typeof newCycleFormValidationSchema>

export function Home() {
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [activeCycleId, setActiveCycleId] = useState<string | null>(null);
    const [amountSecondsPassed, setAmountSecondsPassed] = useState<number>(0);


    const newCycleForm = useForm<NewCycleFormData>({
        resolver: zodResolver(newCycleFormValidationSchema),
        defaultValues: {
            task: '',
            minutesAmount: 0
        }
    });

    const activeCycle = cycles.find(cycle => cycle.id === activeCycleId)

    function setSecondsPassed(secondsPassed: number) {
        setAmountSecondsPassed(secondsPassed)
    }

    const { handleSubmit, watch, reset } = newCycleForm;

    function markCurrentCycleAsFinished() {
        setCycles(state => state.map(cycle => {
            if (cycle.id === activeCycleId) {
                return { ...cycle, finishedDate: new Date() }
            } else {
                return cycle;
            }
        }))
    }

    function handleCreateNewCycle(data: NewCycleFormData) {
        const id = crypto.randomUUID()
        const newCycle: Cycle = {
            id,
            task: data.task,
            minutesAmount: data.minutesAmount,
            startDate: new Date()
        }

        setCycles(state => [...state, newCycle])
        setActiveCycleId(id)
        setAmountSecondsPassed(0);

        reset();
    }

    function handleInterruptCycle() {
        setCycles(state => state.map(cycle => {
            if (cycle.id === activeCycleId) {
                return { ...cycle, interruptedDate: new Date() }
            } else {
                return cycle;
            }
        }))

        setActiveCycleId(null);
    }
    const task = watch('task')
    const isSubmitDisabled = !task

    return (
        <HomeContainer>
            <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
                <CyclesContext.Provider value={{ activeCycle, activeCycleId, markCurrentCycleAsFinished, amountSecondsPassed, setSecondsPassed }}>
                    <FormProvider {...newCycleForm}>
                        <NewCycleForm />
                    </FormProvider>
                    <Countdown />
                </CyclesContext.Provider>
                {activeCycle ? (
                    <StopCountdownButton onClick={handleInterruptCycle} type="button">
                        <HandPalm
                            size={24}
                        />
                        Interromper
                    </StopCountdownButton>
                ) : (
                    <StartCountdownButton
                        disabled={isSubmitDisabled} type="submit">
                        <Play
                            size={24}
                        />
                        Começar
                    </StartCountdownButton>
                )}
            </form>

        </HomeContainer >
    )
}