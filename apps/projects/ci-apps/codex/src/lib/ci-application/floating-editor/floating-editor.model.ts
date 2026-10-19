import { NuMonacoEditorModel } from '@ng-util/monaco-editor';

export interface FloatingWindow {
    id: string;
    title: string;
    filePath: string;
    content: string;
    originalContent: string;
    language?: string;
    lineNumber?: number;
    column?: number;
    symbolName?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    isMaximized: boolean;
    prevGeometry?: { x: number; y: number; width: number; height: number };
    zIndex: number;
    isDirty: boolean;
    model?: NuMonacoEditorModel;
    editorInstance?: any;
    isSaving?: boolean;
}
