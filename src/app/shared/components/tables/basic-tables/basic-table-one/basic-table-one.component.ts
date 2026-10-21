import { Component, input, output, EventEmitter, computed, signal, effect } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { themeQuartz, AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-basic-table-one',
  imports: [ButtonComponent, AgGridAngular],
  templateUrl: './basic-table-one.component.html',
  styleUrls: ['./basic-table-one.component.css'],
})
export class BasicTableOneComponent {

constructor() {
  effect(() => {
    const actions = this.actions();

    // console('Actions changed:', actions);

    if (this.gridApi) {
      this.gridApi.refreshCells({
        force: true
      });
    }
  });
}
private gridApi?: GridApi;

onGridReady(event: GridReadyEvent): void {
  this.gridApi = event.api;
}

  isLoading = input(false);
  columns = input<ColDef[]>([]);
  tableData = input<any[]>([]);

  // Header controls
  showSearch = input(false);
  showAddButton = input(false);

  // Add button configuration
  addButtonText = input('Add');
  addButtonIcon = input<string | null>(null);

  // Row actions
  showActions = input(false);
  private loadingAction = signal<string | null>(null);
  actions = input<any[]>([]);

  addClick = output<void>();
  searchText = signal('');
  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    minWidth: 120,
  };

  theme = themeQuartz;

  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 50];

  columnDefs = computed<ColDef[]>(() => {

    const cols = [
      {
        headerName: 'SL No.',
        width: 80,
        sortable: false,
        filter: false,
        valueGetter: (params: any) => {
          const currentPage = params.api.paginationGetCurrentPage();
          const pageSize = params.api.paginationGetPageSize();

          return currentPage * pageSize + params.node.rowIndex! + 1;
        }
      },
      ...this.columns()];

    if (this.showActions()) {
      cols.push({
        headerName: 'Actions',
        sortable: false,
        filter: false,
        flex: 1,
        cellClass: 'action-cell',
        cellRenderer: (params: any) => {
          const div = document.createElement('div');

          div.className = 'flex items-center gap-2';

          this.actions().forEach(action => {
            // Nothing to render
            if (!action?.icon && !action?.text) {
              return;
            }

            const button = document.createElement('button');

            button.type = 'button';

            const hasIcon = !!action.icon;
            const hasText = !!action.text;

            // --------------------------------
            // TEXT EXISTING → bordered button
            // --------------------------------
            if (hasText) {
              button.className =
                'inline-flex items-center justify-center gap-2 ' +
                'rounded-lg transition px-3 py-2 text-sm ' +
                'bg-white text-gray-700 ' +
                'ring-1 ring-inset ring-gray-300 ' +
                'hover:bg-gray-50 ' +
                'dark:bg-gray-800 dark:text-gray-400 ' +
                'dark:ring-gray-700 ' +
                'dark:hover:bg-white/[0.03] ' +
                'dark:hover:text-gray-300';
            }

            // --------------------------------
            // ICON ONLY → normal icon button
            // --------------------------------
            else if (hasIcon) {
              button.className =
                'flex h-8 w-8 items-center justify-center ' +
                'rounded-md border-0 bg-transparent ' +
                'text-gray-500 transition-colors ' +
                'hover:text-gray-800 ' +
                'dark:text-gray-400 dark:hover:text-white';
            }

            // --------------------------------
            // ICON
            // --------------------------------
            if (hasIcon) {
              const iconWrapper = document.createElement('span');
              iconWrapper.className = 'flex items-center';

              const icon = document.createElement('i');
              icon.className = `bi ${action.icon}`;

              iconWrapper.appendChild(icon);
              button.appendChild(iconWrapper);
            }

            // --------------------------------
            // TEXT
            // --------------------------------
            if (hasText) {
              const text = document.createTextNode(action.text);
              button.appendChild(text);
            }

            button.title = action.label ?? action.text ?? action.key;

            button.addEventListener('click', (event) => {
              event.stopPropagation();
              action.handler?.(params.data);
            });

            div.appendChild(button);
          });

          return div;
        }
      });
    }

    return cols;
  });


  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.searchText.set(value);
  }
}
