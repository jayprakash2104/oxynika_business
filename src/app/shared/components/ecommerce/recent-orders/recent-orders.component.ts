// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-recent-orders',
//   imports: [CommonModule],
//   templateUrl: './recent-orders.component.html',
//   styleUrl: './recent-orders.component.css'
// })
// export class RecentOrdersComponent {

// }



import { Component } from '@angular/core';
// import { TableComponent } from '../../ui/table/table.component';
// import { TableBodyComponent } from '../../ui/table/table-body.component';
// import { TableCellComponent } from '../../ui/table/table-cell.component';
// import { TableHeaderComponent } from '../../ui/table/table-header.component';
// import { TableRowComponent } from '../../ui/table/table-row.component';
import { BadgeComponent } from '../../ui/badge/badge.component';

interface Product {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  image: string;
  status: 'Delivered' | 'Pending' | 'Canceled';
}

@Component({
  selector: 'app-recent-orders',
  imports: [
    BadgeComponent
],
  templateUrl: './recent-orders.component.html'
})
export class RecentOrdersComponent {
  tableData: any[] = [
    {
      id: 1,
      name: "Shilajit Capsules ",
      category: "Shilajit",
      price: "$2399.00",
      status: "Delivered",
      image: "/images/product/product-6.png",
    },
    {
      id: 1,
      name: "Shilajit Capsules ",
      category: "Shilajit",
      price: "$2399.00",
      status: "Pending",
      image: "/images/product/product-6.png",
    },
    {
      id: 1,
      name: "Shilajit Capsules ",
      category: "Shilajit",
      price: "$2399.00",
      status: "Canceled",
      image: "/images/product/product-6.png",
    },
    {
      id: 1,
      name: "Shilajit Capsules ",
      category: "Shilajit",
      price: "$2399.00",
      status: "Delivered",
      image: "/images/product/product-6.png",
    },
    {
      id: 1,
      name: "Shilajit Capsules ",
      category: "Shilajit",
      price: "$2399.00",
      status: "Delivered",
      image: "/images/product/product-6.png",
    },
  ];

  getBadgeColor(status: string): 'success' | 'warning' | 'error' {
    if (status === 'Delivered') return 'success';
    if (status === 'Pending') return 'warning';
    return 'error';
  }
}