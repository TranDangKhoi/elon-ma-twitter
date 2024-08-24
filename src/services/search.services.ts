import databaseService from "~/services/database.services";

class SearchService {
  // No lookup, no join, no populate, no aggregate, no sort, no filter, no pagination
  async simpleSearch({ query, limit, page }: { query: string; limit: number; page: number }) {
    const result = await databaseService.tweets
      .find({
        $text: {
          $search: query,
        },
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray();
    return result;
  }

  async advancedSearch({ query, limit, page }: { query: string; limit: number; page: number }) {
    // Nothing yet
  }
}

const searchService = new SearchService();
export default searchService;
