'use server'

import { ShortenUrlApi } from '@/src/api/ShortenUrlApi'

export const shortenUrl = async (url: string) => ShortenUrlApi.shortenUrl(url)
