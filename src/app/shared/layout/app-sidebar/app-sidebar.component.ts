import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { Component, ElementRef, QueryList, ViewChildren, ChangeDetectorRef, signal } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { combineLatest, Subscription } from 'rxjs';
import { CommonService } from '../../../core/services/common.service';
import { EncryptionService } from '../../../core/services/encryption.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe,
  ],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.css'
})
export class AppSidebarComponent {

  commonService = inject(CommonService);
  private encryptionService = inject(EncryptionService);
  // Main nav items
  navItems = signal<any[]>([]);
  menuLoading = signal(true);
  // Others nav items

  private iconMap: Record<string, string> = {
    dashboard: `<i class="bi bi-speedometer2"></i>`,
    users: `<i class="bi bi-people-fill"></i>`,
    bdo: `<i class="bi bi-person-fill-gear"></i>`,
    stock: `<i class="bi bi-box-seam"></i>`,
    'sub-admins': `<i class="bi bi-person-fill-gear"></i>`,
    permissions: `<i class="bi bi-shield-plus"></i>`,
    'activation-requests': `<i class="bi bi-box-fill"></i>`,
    'packages': `<i class="bi bi-box-fill"></i>`,
    ref_network : `<i class="bi bi-diagram-3-fill"></i>`

  };

  openSubmenu: string | null | number = null;
  subMenuHeights: { [key: string]: number } = {};
  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();
  menu: any;

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  ngOnInit() {
    this.getMenuItems();
    // Subscribe to router events
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    // Subscribe to combined observables to close submenus when all are false
    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(
        ([isExpanded, isMobileOpen, isHovered]) => {
          if (!isExpanded && !isMobileOpen && !isHovered) {
            // this.openSubmenu = null;
            // this.savedSubMenuHeights = { ...this.subMenuHeights };
            // this.subMenuHeights = {};
            this.cdr.detectChanges();
          } else {
            // Restore saved heights when reopening
            // this.subMenuHeights = { ...this.savedSubMenuHeights };
            // this.cdr.detectChanges();
          }
        }
      )
    );

    // Initial load
    this.setActiveMenuFromRoute(this.router.url);
  }

  getMenuItems() {
  this.menuLoading.set(true);
  this.commonService.getMenuItems().subscribe({
    next: async (response: { menu: any[]; permissions: string[] }) => {
    try {
      const encryptedPermissions = sessionStorage.getItem('permissions');
      const permissions: string[] = encryptedPermissions
        ? (await this.encryptionService.decrypt<string[]>(encryptedPermissions)) ?? []
        : [];


      const items = response.menu
        .filter((item) => {
          // Only show menu if user has <key>.view permission
          return permissions.includes(`${item.key}.view`);
        })
        .map((item) => ({
          name: item.title,
          icon: this.iconMap[item.key] ?? this.iconMap['dashboard'],
          path: item.path
        }));

        if (permissions.includes('packages.view')) {
        items.push({
          name: 'Package',
          icon: this.iconMap['packages'],
          path: '/packages'
        });
      }

      const encryptedUser = sessionStorage.getItem('user');

      if (encryptedUser) {
        const user = await this.encryptionService.decrypt<any>(
          encryptedUser
        );

        // Show Requested Packages only for BDO
        if (user?.role === 'BDO') {
          items.unshift({
            name: 'Dashboard',
            icon: this.iconMap['dashboard'],
            path: '/dashboard'
          });
          items.push({
            name: 'Referral Network',
            icon: this.iconMap['ref_network'],
            path: '/referal-network'
          });
        }
      }


      this.navItems.set(items);

      // Re-check active menu after menu is available
      this.setActiveMenuFromRoute(this.router.url);
    } catch (error) {
        console.error('Error processing sidebar menu:', error);
        this.navItems.set([]);
      } finally {
        this.menuLoading.set(false);
      }
    },

    error: (error) => {
      console.error('Error fetching menu items:', error);
      this.navItems.set([]);
    }
  });
}

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges(); // Ensure UI updates
        }
      });
    }
  }

  onSidebarMouseEnter() {
    this.isExpanded$.subscribe(expanded => {
      if (!expanded) {
        this.sidebarService.setHovered(true);
      }
    }).unsubscribe();
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [
      { items: this.navItems(), prefix: 'main' },
    ];

    menuGroups.forEach(group => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem: any) => {
            if (currentUrl === subItem.path) {
              const key = `${group.prefix}-${i}`;
              this.openSubmenu = key;

              setTimeout(() => {
                const el = document.getElementById(key);
                if (el) {
                  this.subMenuHeights[key] = el.scrollHeight;
                  this.cdr.detectChanges(); // Ensure UI updates
                }
              });
            }
          });
        }
      });
    });
  }

  onSubmenuClick() {
    // console('click submenu');
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }  

  
}
