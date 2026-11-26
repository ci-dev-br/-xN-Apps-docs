// music-models.ts
export type TrackType = 'kick' | 'snare' | 'hihat' | 'bass' | 'lead' | 'pad';

export interface Track {
    id: string;
    name: string;
    frequency: number;
    steps: boolean[];
    type?: TrackType;
    volume?: number;
    muted?: boolean;
    solo?: boolean;
    color?: string;
}

export interface ProjectMaster {
    id?: string;
    projectName: string;
    author: string;
    genre: string;
    description: string;
    bpm: number;
    tracks: Track[];
}
