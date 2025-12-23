import s from "./style.module.scss"
import { VStack } from "@/components/general/VStack"
import { ExperimentOneSection } from "@/components/lab/ExperimentOneSection"

export default function Lab() {
  return (
    <VStack className={s.container}>
      <h1>Lab Page</h1>
      
      <h2>Experiment 1: Collision & Momentum</h2>
      <ExperimentOneSection />
    </VStack>
  )
}
