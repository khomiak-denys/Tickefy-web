import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {LucideAngularModule} from "lucide-angular";
import {Observable} from 'rxjs';

@Component({
  selector: 'app-teams-tab',
    imports: [
        AsyncPipe,
        LucideAngularModule
    ],
  templateUrl: './teams-tab.component.html',
  styleUrl: './teams-tab.component.scss'
})
export class TeamsTabComponent {
  @Input() teams$?: Observable<any[] | null>;
  @Output() selectedTeamId = new EventEmitter<string>();

  onTeamClick(id : string) {
    this.selectedTeamId.emit(id);
  }
}
