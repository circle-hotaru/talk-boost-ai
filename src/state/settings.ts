import { atom } from 'jotai'

export const openVoiceAtom = atom(true)
export const openAiCount = atom(0)

export const recordNowHistory = atom(0)

export const recordNowHistoryName = atom('')
export const isShowVoiceSettingModal = atom(false)
export const voiceIdAtom = atom('en-US-JennyNeural')
