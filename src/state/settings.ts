import { atom } from 'jotai'
import { voices } from '~/constants'

export const openVoiceAtom = atom(true)
export const openAiCount = atom(0)

export const recordNowHistory = atom(0)

export const recordNowHistoryName = atom('')
export const voiceIdAtom = atom(voices[0].id)
