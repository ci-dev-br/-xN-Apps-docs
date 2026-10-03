// music-models.ts
export interface Track {
    id: string;
    name: string;
    frequency: number;
    steps: boolean[];
}

export interface ProjectMaster {
    id?: string;
    projectName: string;
    author: string;      // Novo campo de metadado
    genre: string;       // Novo campo de metadado
    description: string; // Novo campo de metadado
    bpm: number;
    tracks: Track[];
}