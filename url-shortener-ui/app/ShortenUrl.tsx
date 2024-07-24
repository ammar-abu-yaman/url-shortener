'use client'

import { FormEvent, useState } from "react"
import { match, P } from "ts-pattern";
import styles from '@/styles/ShortUrl.module.scss';


type State = 
| { type: 'form' }
| { type: 'result', result: ShortenUrlResult };

type SetStateAction = (state: State) => void;

type ShortenUrlResult = { 
    shortenedUrl: string;
    originalUrl: string;
 };

export default function ShortenUrl() {
    const [state, setState] = useState<State>({type: 'form'});
    return <div className={styles['container']}>{ 
        match(state)
            .with({ type: 'form' }, () => <ShortenUrlFormComponent setState={setState}/>)
            .with({ type: 'result', result: P.select() }, (result) => <ShortenUrlResultComponent result={result} setState={setState} /> )
            .exhaustive()
    }</div>
}


function ShortenUrlFormComponent({ setState } : { setState: SetStateAction }) {
    const [url, setUrl] = useState<string>('');

    const submitForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const body = { url };
        let result: ShortenUrlResult = await Promise.resolve(body)
            .then(() => ({
                shortenedUrl: '12345678',
                originalUrl: url,
            }));
        setState({
            type: 'result',
            result,
        });
    };

    return <>
            <h4 style={{marginBottom: "12px"}}>Shorten a long URL</h4>
            <form className={styles['shorten-url-form']} onSubmit={submitForm}>
                <div className={styles['input-group']}>
                    <input name="url" className={styles['input-field']} type="url" value={url} onChange={event => setUrl(event.target.value)}/>
                </div>
                <input type="Submit" className={styles['submit-button']} value="Submit"/>
            </form>
        </>
}

function ShortenUrlResultComponent({ result, setState } : { result: ShortenUrlResult, setState: SetStateAction }) {
    return <div>
        <div className={styles['input-group']}>
            <label className={styles['input-label']}>Shortened URL </label> 
            <input readOnly={true} className={styles['input-field']} name="shortenedUrl" value={result.shortenedUrl}/>
        </div>
        <div className={styles['input-group']}>
            <label className={styles['input-label']}>Original URL </label>
            <input readOnly={true} className={styles['input-field']} name="originalUrl" value={result.originalUrl}/>
        </div>
        <button className={styles['submit-button']} onClick={() => setState({ type: 'form' })}>Shorten Another URL</button>
    </div>

}