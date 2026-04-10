import deep from "./commands/websearch/deep.ts";
import fetch from "./commands/websearch/fetch.ts";
import news from "./commands/websearch/news.ts";
import providerGet from "./commands/websearch/provider/get.ts";
import providerReset from "./commands/websearch/provider/reset.ts";
import providerSelect from "./commands/websearch/provider/select.ts";
import providerSet from "./commands/websearch/provider/set.ts";
import search from "./commands/websearch/search.ts";

export default [
  search,
  news,
  fetch,
  deep,
  providerGet,
  providerSet,
  providerSelect,
  providerReset,
];
