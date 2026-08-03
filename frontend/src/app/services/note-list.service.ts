import { Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];
  trashNotes: Note[] = [];

  // Configured in src/environments/, do not hardcode it here.
  apiEndpoint = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.getNoteList();
  }

  getNoteList() {
    this.http.get<Note[]>(this.apiEndpoint).subscribe(
      data => {
        this.sortNotes(data);
      },
      error => console.error('Loading error:', error)
    );
  }

  sortNotes(data: Note[]) {
    this.normalNotes = data.filter(note => !note.marked && !note.trash);
    this.normalMarkedNotes = data.filter(note => note.marked && !note.trash);
    this.trashNotes = data.filter(note => note.trash);
  }

  addNote(note: Note) {
    this.http.post<Note[]>(this.apiEndpoint, note).subscribe(
      () => {
        this.getNoteList();
      },
      error => console.error('Error saving note:', error));
  }

  updateNote(note: Note) {
    const url = `${this.apiEndpoint}${note.id}/`;

    this.http.put<Note[]>(url, note).subscribe(
      () => {
        this.getNoteList();
      },
      error => console.error('Error saving note:', error));
  }

  deleteNote(note: Note) {
    const url = `${this.apiEndpoint}${note.id}/`;

    this.http.delete<Note[]>(url).subscribe(
      () => {
        this.getNoteList();
      },
      error => console.error('Error deleting note:', error));
  }
}
