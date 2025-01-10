import ShortenUrl from '@/app/ShortenUrl'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

describe('Test URL Shortener Client Component', () => {
    it('Should initially render a form', () => {
        render(<ShortenUrl />)
        const form = screen.getByRole('form')
        expect(form).not.toBeNull()

        const inputs = form.getElementsByTagName('input')

        expect(inputs[0]).toHaveAttribute('type', 'url')
        expect(inputs[0]).toHaveAttribute('placeholder', 'Enter URL to Shorten')

        expect(inputs[1]).toHaveAttribute('type', 'submit')
        expect(inputs[1]).toHaveAttribute('value', 'Submit')
    })

    it('Should switch to Results when submitting URL and back to form when button clicked', async () => {
        render(<ShortenUrl />)
        const form = screen.getByRole('form')
        const inputs = form.getElementsByTagName('input')
        inputs[0].value = 'https://example.com'
        fireEvent.click(inputs[1])

        await waitFor(() => expect(screen.getByLabelText('Shortened URL')).toBeInTheDocument())

        const shortUrlInput = screen.getByLabelText('Shortened URL')
        expect(shortUrlInput).not.toBeNull()
        expect(shortUrlInput).toHaveAttribute('readonly')

        const originalUrlInput = screen.getByLabelText('Original URL')
        expect(originalUrlInput).not.toBeNull()
        expect(originalUrlInput).toHaveAttribute('readonly')

        const returnButton = screen.getByText('Shorten Another URL')
        fireEvent.click(returnButton)

        await waitFor(() => expect(screen.getByRole('form')).toBeInTheDocument())
    })
})
