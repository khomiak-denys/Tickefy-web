import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, catchError, map, of } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import { AttachmentUploadResponse } from '../api/dtos/attachment-upload.response.dto';

@Injectable({
  providedIn: 'root',
})
export class AttachmentsService {
  constructor(private http: HttpClient) {}

  upload(
    response: AttachmentUploadResponse,
    file: File
  ): Observable<{ fileName: string; success: boolean }> {
    const s3upload$ = this.http.put(`${response.UploadUrl}`, file).pipe(
      map(() => true),

      catchError(() => this.fail(response.AttachmentId, file.size).pipe(map(() => false)))
    );

    return s3upload$.pipe(
      switchMap((uploaded) => {
        if (!uploaded) {
          return of({ fileName: file.name, success: false });
        }
        return this.finish(response.AttachmentId, file.size).pipe(
          map(() => ({ fileName: file.name, success: true })),
          catchError(() => of({ fileName: file.name, success: true }))
        );
      })
    );
  }

  private finish(attachmentId: string, sizeBytes: number): Observable<unknown> {
    return this.http.put(
      `${API_BASE_URL}/api/v1/attachments/${attachmentId}/finish`,
      { sizeBytes: sizeBytes },
      { withCredentials: true }
    );
  }

  private fail(attachmentId: string, sizeBytes: number): Observable<unknown> {
    return this.http.put(
      `${API_BASE_URL}/api/v1/attachments/${attachmentId}/fail`,
      { sizeBytes: sizeBytes },
      { withCredentials: true }
    );
  }
}
