import {useState} from 'react'

export const useModalState = (initial = false) => {
    const [isOpen, setIsOpen] = useState(initial)

    return [isOpen, () => setIsOpen(true), () => setIsOpen(false)]
}