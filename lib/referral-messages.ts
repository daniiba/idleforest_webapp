import { formatTrees } from '@/lib/referral-reward-settings'

// Ready-made messages members send to people they know. Shared by the web
// app and the referral emails, so the wording is the same everywhere.
// Plain and friendly on purpose: no jargon, no dashes.

type Reward = { enabled?: boolean; treesPerPerson: number; minActiveDays: number }

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.idleforest.com'

export function giftWords(reward: Pick<Reward, 'treesPerPerson'>) {
    return reward.treesPerPerson === 1 ? 'a tree' : formatTrees(reward.treesPerPerson)
}

export function inviteMessage(url: string, reward: Reward | null) {
    return reward && reward.enabled !== false
        ? `I use IdleForest. It runs quietly on my computer and plants real trees with internet I'm not using. Join with my link and we both get ${giftWords(reward)} planted: ${url}`
        : `I use IdleForest. It runs quietly on my computer and plants real trees with internet I'm not using. Join me here: ${url}`
}

export function reminderMessage(friendName: string | null, reward: Reward | null) {
    const greeting = friendName ? `Hey ${friendName}!` : 'Hey!'
    const setupUrl = `${APP_URL}/welcome?utm_source=referral_reminder`
    const gift = reward && reward.enabled !== false
        ? ` Once it runs for ${reward.minActiveDays} days, we both get ${giftWords(reward)} planted.`
        : ''
    return `${greeting} Did you get IdleForest running?${gift} Here is the link in case you need it: ${setupUrl}`
}

export function whatsappUrl(text: string) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function emailShareUrl(subject: string, body: string) {
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
