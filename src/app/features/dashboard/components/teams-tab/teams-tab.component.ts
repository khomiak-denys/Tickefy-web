import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { TeamSummary } from '../../../../core/api/dtos';

@Component({
  selector: 'app-teams-tab',
  imports: [AsyncPipe, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teams-tab.component.html',
  styleUrl: './teams-tab.component.scss',
})
export class TeamsTabComponent {
  @Input() teams$: Observable<TeamSummary[] | null> = new Observable<TeamSummary[] | null>();
  @Output() selectedTeamId = new EventEmitter<string>();

  onTeamClick(id: string) {
    this.selectedTeamId.emit(id);
  }
}
