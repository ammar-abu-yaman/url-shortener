'use client'

import { FormEvent, useState } from 'react'
import { match, P } from 'ts-pattern'
import styles from '@/styles/ShortUrl.module.scss'
import { ShortenUrlApi } from '@/src/api/ShortenUrlApi'
import { ShortenedUrl } from '@/src/types/shortened-url'

type State = { type: 'form' } | { type: 'result'; result: ShortenedUrl }

// eslint-disable-next-line no-unused-vars
type SetStateAction = (state: State) => void

export default function ShortenUrl() {
    const [state, setState] = useState<State>({ type: 'form' })
    return (
        <div className={styles['container']}>
            {match(state)
                .with({ type: 'form' }, () => <ShortenUrlFormComponent setState={setState} />)
                .with({ type: 'result', result: P.select() }, (result) => <ShortenUrlResultComponent result={result} setState={setState} />)
                .exhaustive()}
        </div>
    )
}

function ShortenUrlFormComponent({ setState }: { setState: SetStateAction }) {
    const [url, setUrl] = useState<string>('')
    const [errorMessage, setError] = useState<string | null>(null)

    const submitForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const result = await ShortenUrlApi.shortenUrl(url)
        match(result)
            .with({ type: 'success', data: P.select() }, (data) =>
                setState({
                    type: 'result',
                    result: data,
                }),
            )
            .with({ type: 'error', err: P.select() }, (err) => setError(err))
            .exhaustive()
    }

    return (
        <>
            <h4 style={{ marginBottom: '12px' }}>Shorten a long URL</h4>
            <form role="form" className={styles['shorten-url-form']} onSubmit={submitForm}>
                <div className={styles['input-group']}>
                    <input
                        name="url"
                        placeholder="Enter URL to Shorten"
                        className={styles['input-field']}
                        type="url"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                    />
                </div>
                <input type="submit" className={styles['submit-button']} value="Submit" />
            </form>
            {errorMessage != null ? <h5 className={styles['error-message']}>{errorMessage}</h5> : <></>}
        </>
    )
}

function ShortenUrlResultComponent({ result, setState }: { result: ShortenedUrl; setState: SetStateAction }) {
    return (
        <div>
            <div className={styles['input-group']}>
                <label htmlFor="shortenedUrl" className={styles['input-label']}>
                    Shortened URL
                </label>
                <input readOnly={true} className={styles['input-field']} id="shortenedUrl" name="shortenedUrl" value={`${window.location.origin}/${result.id}`} />
            </div>
            <div className={styles['input-group']}>
                <label htmlFor="originalUrl" className={styles['input-label']}>
                    Original URL
                </label>
                <input readOnly={true} className={styles['input-field']} id="originalUrl" name="originalUrl" value={result.originalUrl} />
            </div>
            <button className={styles['submit-button']} onClick={() => setState({ type: 'form' })}>
                Shorten Another URL
            </button>
        </div>
    )
}
