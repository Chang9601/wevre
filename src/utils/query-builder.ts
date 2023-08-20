import { SortOrder } from 'mongoose';

export class QueryBuilder {
  constructor(private search: string, private sort: string) {}

  private searchOptions = ['itemName', 'artistName'];
  private sortOptions = ['initialBid', 'completionDate', 'artistName'];

  buildSearchQuery(option: string) {
    const searchQuery = {};

    switch (option) {
      case 'itemName':
        searchQuery[this.searchOptions[0]] = this.search;
        break;
      case 'artistName':
        searchQuery[this.searchOptions[1]] = this.search;
        break;
      default:
    }

    return searchQuery;
  }

  buildSortQuery(): [string, SortOrder][] {
    switch (this.sort) {
      case 'high':
        return [[this.sortOptions[0], -1]];
      case 'low':
        return [[this.sortOptions[0], 1]];
      case 'date':
        return [[this.sortOptions[1], -1]];
      case 'name':
        return [[this.sortOptions[2], 1]];
      default:
        return [[this.sortOptions[1], -1]];
    }
  }
}
