import { ShortenUrlApi, ShortenUrlResponse } from '@/src/api/ShortenUrlApi'
import { redirect, RedirectType } from 'next/navigation'
import styles from '@/styles/Resolver.module.scss'

type Params = {
    id: string
}

export const revalidate = 60

export default async function Page({ params }: { params: Promise<Params> }) {
    const { id } = await params
    const result: ShortenUrlResponse = await ShortenUrlApi.resolveUrl(id)

    if (result.type === 'success') {
        redirect(result.data.originalUrl, RedirectType.replace)
    }

    return (
        <div className={styles['error-message-container']}>
            <h1 className={styles['error-message']}>{result.err}</h1>
        </div>
    )
}
