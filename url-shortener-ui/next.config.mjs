import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
}

export default nextConfig
