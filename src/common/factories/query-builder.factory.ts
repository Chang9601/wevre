import { SortOrder } from 'mongoose';

export class QueryBuilder {
  constructor(private search: string, private sort: string) {}

  private searchOptions = ['itemName', 'artistName'];
  private dateOptions = ['startDate', 'endDate'];
  private sortOptions = ['initialBid', 'completionDate', 'artistName'];

  private today = new Date().toISOString();

  buildSearchQuery(option: string) {
    const searchQuery = {};

    if (this.search) {
      switch (option) {
        case 'itemName':
          searchQuery[this.searchOptions[0]] = this.search;
          break;
        case 'artistName':
          searchQuery[this.searchOptions[1]] = this.search;
          break;
        default:
          break;
      }
    }

    const dateQuery = {};

    dateQuery[this.dateOptions[0]] = { $lte: new Date(this.today) };
    dateQuery[this.dateOptions[1]] = { $gte: new Date(this.today) };

    Object.assign(searchQuery, dateQuery);

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
