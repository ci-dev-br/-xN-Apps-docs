import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DiskLogFileInfo } from '../../models/dev-tools.model';
import { DevToolsFilesService } from '../../services/dev-tools-files.service';

@Component({
    selector: 'ci-disk-logs-viewer',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
    ],
    templateUrl: './disk-logs-viewer.component.html',
    styleUrls: ['./disk-logs-viewer.component.scss'],
})
export class DiskLogsViewerComponent implements OnInit {
    public files: DiskLogFileInfo[] = [];
    public filteredFiles: DiskLogFileInfo[] = [];
    public selectedFile: DiskLogFileInfo | null = null;
    public fileContent: string = '';
    public isLoadingList: boolean = false;
    public isLoadingContent: boolean = false;
    public searchFile: string = '';
    public filterType: string = 'ALL';

    constructor(private readonly filesService: DevToolsFilesService) {}

    ngOnInit(): void {
        this.loadFiles();
    }

    public loadFiles(): void {
        this.isLoadingList = true;
        this.filesService.listServerLogFiles().subscribe({
            next: (list) => {
                this.files = list;
                this.applyFilter();
                this.isLoadingList = false;
                if (!this.selectedFile && this.filteredFiles.length > 0) {
                    this.selectFile(this.filteredFiles[0]);
                }
            },
            error: () => {
                this.isLoadingList = false;
            },
        });
    }

    public applyFilter(): void {
        let list = [...this.files];
        if (this.filterType !== 'ALL') {
            list = list.filter((f) => f.type === this.filterType);
        }
        if (this.searchFile) {
            const s = this.searchFile.toLowerCase();
            list = list.filter((f) => f.name.toLowerCase().includes(s));
        }
        this.filteredFiles = list;
    }

    public selectFile(file: DiskLogFileInfo): void {
        this.selectedFile = file;
        this.isLoadingContent = true;
        this.fileContent = '';
        this.filesService.readLogFileContent(file.path).subscribe({
            next: (content) => {
                this.fileContent = content;
                this.isLoadingContent = false;
            },
            error: () => {
                this.isLoadingContent = false;
            },
        });
    }

    public copyContent(): void {
        if (!this.fileContent) return;
        navigator.clipboard.writeText(this.fileContent);
    }

    public downloadFile(): void {
        if (!this.selectedFile || !this.fileContent) return;
        const blob = new Blob([this.fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.selectedFile.name;
        a.click();
        URL.revokeObjectURL(url);
    }
}
