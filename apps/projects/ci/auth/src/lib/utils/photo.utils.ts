/**
 * Utilitário para formatação e normalização de URLs de foto de perfil.
 * Suporta data-URIs, base64 puro, URLs remotas, Buffers e objetos serializados do TypeORM.
 */
export function formatUserPhotoUrl(photo: any): string | null {
    if (!photo) return null;

    // Caso 1: String direta
    if (typeof photo === 'string') {
        const trimmed = photo.trim();
        if (!trimmed) return null;
        if (
            trimmed.startsWith('data:image/') ||
            trimmed.startsWith('http://') ||
            trimmed.startsWith('https://') ||
            trimmed.startsWith('/') ||
            trimmed.startsWith('blob:')
        ) {
            return trimmed;
        }
        // Base64 puro
        return `data:image/jpeg;base64,${trimmed}`;
    }

    // Caso 2: Objeto com propriedade url
    if (photo.url && typeof photo.url === 'string') {
        return photo.url;
    }

    // Caso 3: Objeto Photo do Storage com originalFile
    const rawFile = photo.originalFile || photo.file || photo.data;
    if (!rawFile) return null;

    if (typeof rawFile === 'string') {
        const trimmedFile = rawFile.trim();
        if (!trimmedFile) return null;
        if (
            trimmedFile.startsWith('data:image/') ||
            trimmedFile.startsWith('http://') ||
            trimmedFile.startsWith('https://')
        ) {
            return trimmedFile;
        }

        let mime = (photo.format || 'image/jpeg').trim();
        // Remove prefixo data: caso já exista para normalizar
        if (mime.startsWith('data:')) {
            mime = mime.substring(5);
        }
        // Remove ;base64 se já contiver
        if (mime.includes(';base64')) {
            mime = mime.split(';base64')[0];
        }
        if (!mime.startsWith('image/')) {
            mime = `image/${mime}`;
        }

        return `data:${mime};base64,${trimmedFile}`;
    }

    // Caso 4: Array de bytes / Uint8Array / Buffer serializado como JSON
    if (Array.isArray(rawFile) || rawFile instanceof Uint8Array || rawFile?.type === 'Buffer') {
        try {
            const bytes: number[] = Array.isArray(rawFile) ? rawFile : Array.from(rawFile.data || rawFile);
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode.apply(null, bytes.slice(i, i + chunkSize));
            }
            const base64 = btoa(binary);
            let mime = photo.format || 'image/jpeg';
            if (mime.startsWith('data:')) mime = mime.substring(5);
            if (mime.includes(';base64')) mime = mime.split(';base64')[0];
            if (!mime.startsWith('image/')) mime = `image/${mime}`;

            return `data:${mime};base64,${base64}`;
        } catch (e) {
            console.warn('Falha ao converter bytes da foto para base64:', e);
            return null;
        }
    }

    return null;
}
