import { Component, OnInit, computed, inject, signal, } from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { EncryptionService } from '../../core/services/encryption.service';
import { AlertService } from '../../core/services/alert.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
@Component({
  imports: [PageBreadcrumbComponent, CommonModule,
    NgTemplateOutlet, ButtonComponent],
  selector: 'app-referal-network',
  styleUrl: './referal-network.component.css',
  templateUrl: './referal-network.component.html',
})
export class ReferalNetworkComponent {

  readonly commonService = inject(CommonService);
  private readonly encryptionService = inject(EncryptionService);
  private readonly alertService = inject(AlertService);
  readonly currentUser = signal<any | null>(null);
  readonly referralTree = signal<any[]>([]);
  readonly isLoading = signal(true);
  readonly searchTerm = signal('');
  readonly expandedIds = signal<Set<number>>(new Set<number>());


  
readonly filteredTree = computed(() => {
  const term = this.searchTerm().trim().toLowerCase();
  const nodes = this.referralTree();

  if (!term) {
    return nodes;
  }

  const matches = (node: any): boolean => {
    return (
      node.name.toLowerCase().includes(term) ||
      node.email.toLowerCase().includes(term) ||
      node.referral_code.toLowerCase().includes(term) ||
      String(node.id).includes(term)
    );
  };

  const filterNodes = (items: any[]): any[] => {
    return items.reduce<any[]>((result, node) => {
      const matchingChildren = filterNodes(node.children ?? []);

      if (matches(node)) {
        // Keep the complete subtree when this BDO matches.
        result.push(node);
      } else if (matchingChildren.length > 0) {
        // Otherwise, retain matching descendants and their ancestors.
        result.push({
          ...node,
          children: matchingChildren,
        });
      }

      return result;
    }, []);
  };

  return filterNodes(nodes);
});


  readonly totalReferrals = computed(() => {
    const countNodes = (nodes: any[]): number =>
      nodes.reduce(
        (total, node) =>
          total + 1 + countNodes(node.children ?? []),
        0,
      );

    return countNodes(this.referralTree());
  });

  readonly activeReferrals = computed(() => {
    const countNodes = (nodes: any[]): number =>
      nodes.reduce(
        (total, node) =>
          total +
          (node.bdo_status ? 1 : 0) +
          countNodes(node.children ?? []),
        0,
      );

    return countNodes(this.referralTree());
  });

  ngOnInit(): void {
    void this.loadCurrentUser();
    this.fetchBdoNetwork();
  }

  /**
   * The logged-in user's profile is encrypted in session storage.
   * EncryptionService.decrypt() is asynchronous and returns T | null.
   */
  private async loadCurrentUser(): Promise<void> {
    try {
      const encryptedUser = sessionStorage.getItem('user');

      if (!encryptedUser) {
        this.alertService.error('Login information was not found. Please sign in again.', 'Error');
        return;
      }

      const decryptedUser =
        await this.encryptionService.decrypt<any | { user?: any; data?: any }>(
          encryptedUser,
        );

      if (!decryptedUser) {
        this.alertService.error('Unable to read your account information. Please sign in again', 'Error');
        return;
      }

      // Support both a direct user object and common wrapped response shapes.
      const user =
        ('user' in decryptedUser && decryptedUser.user
          ? decryptedUser.user
          : 'data' in decryptedUser && decryptedUser.data
            ? decryptedUser.data
            : decryptedUser) as any;

      this.currentUser.set(user);
    } catch (error) {
      console.error('Error decrypting logged-in user:', error);
      this.alertService.error('Unable to load your account information.', 'Error');
    }
  }

  /**
   * Loads the referral hierarchy from the existing API.
   */
  fetchBdoNetwork(): void {
    this.isLoading.set(true);

    this.commonService.fetchBdoNetwork().subscribe({
      next: (response) => {
        const data = response?.data ?? response;
        const tree = data?.tree ?? [];

        this.referralTree.set(Array.isArray(tree) ? tree : []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching BDO network:', error);
        this.alertService.error('Unable to load the referral network.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  toggleNode(id: number): void {
    this.expandedIds.update((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  isExpanded(id: number): boolean {
    return this.expandedIds().has(id);
  }

  expandAll(): void {
    const ids = new Set<number>();

    const collectIds = (nodes: any[]): void => {
      for (const node of nodes) {
        if (node.children?.length) {
          ids.add(node.id);
          collectIds(node.children);
        }
      }
    };

    collectIds(this.referralTree());
    this.expandedIds.set(ids);
  }

  collapseAll(): void {
    this.expandedIds.set(new Set<number>());
  }

  
onSearch(value: string): void {
  this.searchTerm.set(value);

  if (!value.trim()) {
    return;
  }

  const term = value.trim().toLowerCase();
  const ids = new Set<number>();

  const collectMatches = (nodes: any[]): void => {
    for (const node of nodes) {
      const matches =
        node.name.toLowerCase().includes(term) ||
        node.email.toLowerCase().includes(term) ||
        node.referral_code.toLowerCase().includes(term) ||
        String(node.id).includes(term);

      if (matches) {
        // Expand the matching BDO and all descendants.
        const expandSubtree = (item: any): void => {
          if (item.children?.length) {
            ids.add(item.id);
            item.children.forEach(expandSubtree);
          }
        };

        expandSubtree(node);
      }

      // Expand ancestors containing matching descendants.
      if (node.children?.length) {
        collectMatches(node.children);

        if (
          node.children.some(
            (child:any) =>
              child.name.toLowerCase().includes(term) ||
              child.email.toLowerCase().includes(term) ||
              child.referral_code.toLowerCase().includes(term) ||
              String(child.id).includes(term)
          )
        ) {
          ids.add(node.id);
        }
      }
    }
  };

  collectMatches(this.referralTree());
  this.expandedIds.set(ids);
}


  trackById(_index: number, node: any): number {
    return node.id;
  }

}
