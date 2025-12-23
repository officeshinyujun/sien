'use client'

import { HStack } from "../HStack"
import Logo from "../Logo"
import s from "./style.module.scss"
import Button from "../Button"
import { useRouter } from "next/navigation";

export default function Header() {
    const router = useRouter();
    return(
        <HStack className={s.container} align="center" justify="between" direction="row">
            <Logo scale = {24}/>
            <HStack align="center" justify="center" direction="row" gap={12}>
                <Button
                    className={s.start}
                    onClick={() => router.push('/signin')}
                >
                    Get started
                </Button>
                <Button
                    className={s.i8n}
                >
                    EN
                </Button>
            </HStack>
        </HStack>
    )
}