import axios, { AxiosError } from 'axios'
import { ShortenedUrl } from '@/src/types'

export type ShortenUrlError = {
    error: string
}
export type ShortenUrlResponse = { type: 'success'; data: ShortenedUrl } | { type: 'error'; err: string }

const client = axios.create({
    baseURL: process.env.SHORTEN_URL_API_URL,
    timeout: 3000,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
})

console.log('Using ShortenUrlApi', client)

export const ShortenUrlApi = {
    async shortenUrl(url: string): Promise<ShortenUrlResponse> {
        try {
            let response = await client.post<ShortenedUrl>('/create', { url })
            return {
                type: 'success',
                data: response.data,
            }
        } catch (error: any) {
            const err = error as AxiosError<ShortenUrlError>
            console.log('Error [ShortenUrlApi.shortenUrl]', err)
            return {
                type: 'error',
                err: err.response?.data?.error ?? 'Service unreachable',
            }
        }
    },
    async resolveUrl(id: string): Promise<ShortenUrlResponse> {
        try {
            let response = await client.get<ShortenedUrl>(`/${id}`)
            return {
                type: 'success',
                data: response.data,
            }
        } catch (error: any) {
            const err = error as AxiosError<ShortenUrlError>
            console.log('Error [ShortenUrlApi.resolveUrl]', err)
            return {
                type: 'error',
                err: err.response?.data?.error ?? 'Service unreachable',
            }
        }
    },
}
