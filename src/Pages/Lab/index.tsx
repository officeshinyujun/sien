import s from "./style.module.scss"
import { VStack } from "@/components/general/VStack"
import { ExperimentOneSection } from "@/components/lab/ExperimentOneSection"

export default function Lab() {
  return (
    <VStack className={s.container}>
      <h1>Lab Page</h1>
      <ExperimentOneSection />
    </VStack>
  )
}
