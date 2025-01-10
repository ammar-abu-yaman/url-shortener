import axios from 'axios'
import { SHORTEN_API_URL } from '@/src/constant'
import { ShortenedUrl } from '@/src/types'

export type ShortenUrlResponse = { type: 'success'; data: ShortenedUrl } | { type: 'error'; err: string }

const client = axios.create({
    baseURL: SHORTEN_API_URL,
    timeout: 3000,
})

export const ShortenUrlApi = {
    async shortenUrl(url: string): Promise<ShortenUrlResponse> {
        try {
            let response = await client.post('/create/', { url })
            return {
                type: 'success',
                data: response.data,
            }
        } catch (err: any) {
            return {
                type: 'error',
                err: err.response.data.error,
            }
        }
    },
    async resolveUrl(id: string): Promise<ShortenUrlResponse> {
        try {
            let response = await client.get(`/${id}`)
            return {
                type: 'success',
                data: response.data,
            }
        } catch (err: any) {
            return {
                type: 'error',
                err: err.response.data.error,
            }
        }
    },
}
